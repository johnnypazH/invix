import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AppDataSource } from '../config/data-source';
import { Wallet } from '../models/Wallet';

const router = Router();

// Tipagem para o formato de ativo na carteira
interface Asset {
  ticker: string;
  quantity: number;
}

/**
 * Calcula a previsão de dividendos para uma carteira de ativos.
 * @param wallet - Um array de ativos, cada um com 'ticker' e 'quantity'.
 * @returns Um objeto com o total previsto, detalhes por ativo e uma mensagem.
 */
async function calculateWalletPrediction(wallet: Asset[]) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateString = oneYearAgo.toISOString().split('T')[0];

  let totalWalletPrediction = 0;
  const assetsDetails = [];

  // Itera sobre cada ativo da carteira para calcular a previsão
  for (const item of wallet) {
    const tickerStr = item.ticker.toUpperCase();
    const qty = item.quantity; // A quantidade já deve ser um número

    const { data, error } = await supabase
      .from('dividends')
      .select('amount')
      .eq('ticker', tickerStr)
      .gte('payment_date', dateString);

    if (error) throw error;

    const totalPerShare = data.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const projectedTotal = totalPerShare * qty;
    
    totalWalletPrediction += projectedTotal;

    assetsDetails.push({
      ticker: tickerStr,
      quantity: qty,
      projected_total: Number(projectedTotal.toFixed(2))
    });
  }

  return {
    total_wallet_prediction: Number(totalWalletPrediction.toFixed(2)),
    assets: assetsDetails,
    message: `Com base nos últimos 12 meses, sua carteira completa renderia aproximadamente R$ ${totalWalletPrediction.toFixed(2)} em 1 ano.`
  };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { ticker, quantity } = req.query;

    // Validação básica
    if (!ticker || !quantity) {
      res.status(400).json({ error: 'Os parâmetros "ticker" e "quantity" são obrigatórios.' });
      return;
    }

    const tickerStr = (ticker as string).toUpperCase();
    const qty = parseInt(quantity as string, 10);

    if (isNaN(qty) || qty <= 0) {
      res.status(400).json({ error: 'A quantidade deve ser um número inteiro maior que zero.' });
      return;
    }

    // Calcula a data de exatamente 1 ano atrás
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateString = oneYearAgo.toISOString().split('T')[0];

    // Busca todos os dividendos do último ano para a ação
    const { data, error } = await supabase
      .from('dividends')
      .select('amount')
      .eq('ticker', tickerStr)
      .gte('payment_date', dateString); // gte = Greater Than or Equal (Maior ou igual a data de 1 ano atrás)

    if (error) throw error;

    // Soma o valor total pago por ação no último ano
    const totalPerShare = data.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Calcula a projeção para a quantidade de ações da carteira do usuário
    const projectedTotal = totalPerShare * qty;

    res.json({
      ticker: tickerStr,
      quantity: qty,
      projected_dividend_per_share: Number(totalPerShare.toFixed(4)),
      projected_total: Number(projectedTotal.toFixed(2)),
      message: `Com base nos últimos 12 meses, suas ${qty} ações da ${tickerStr} renderiam aproximadamente R$ ${projectedTotal.toFixed(2)} em 1 ano.`
    });

  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar a previsão', details: err.message });
  }
});

router.post('/wallet', async (req: Request, res: Response) => {
  try {
    const { wallet }: { wallet: Asset[] } = req.body;

    if (!wallet || !Array.isArray(wallet) || wallet.length === 0) {
      res.status(400).json({ error: 'O corpo da requisição deve conter um array "wallet" válido com os ativos.' });
      return;
    }

    // Validação de cada item da carteira
    for (const item of wallet) {
      if (!item.ticker || typeof item.ticker !== 'string' || !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({ error: 'Cada item no array "wallet" deve ter "ticker" (string) e "quantity" (número > 0).' });
      }
    }

    const prediction = await calculateWalletPrediction(wallet);

    res.json(prediction);

  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao processar a previsão da carteira', details: err.message });
  }
});

// NOVA ROTA: GET /api/predictions/wallet/:walletId
// Pega uma carteira salva no banco e calcula a previsão de dividendos para ela.
router.get('/wallet/:walletId', async (req: Request, res: Response) => {
  try {
      const { walletId } = req.params;

      const walletRepository = AppDataSource.getRepository(Wallet);
      // Usando findOneByOrFail para buscar pelo ID.
      const savedWallet = await walletRepository.findOneByOrFail({ id: walletId as string });
      const prediction = await calculateWalletPrediction(savedWallet.assets);
      res.json(prediction);

  } catch (err: any) {
      // O erro 'EntityNotFoundError' do findOneByOrFail será capturado aqui.
      if (err.name === 'EntityNotFoundError') {
        return res.status(404).json({ message: 'Carteira não encontrada.' });
      }
      res.status(500).json({ error: 'Erro ao processar a previsão da carteira salva', details: err.message });
  }
});

export default router;