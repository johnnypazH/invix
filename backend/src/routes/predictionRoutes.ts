import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AppDataSource } from '../config/data-source';
import { Wallet } from '../models/Wallet';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

interface Asset {
  ticker: string;
  quantity: number;
  precoMedio?: number;
  dataCompra?: string;
}

async function calculateWalletPrediction(wallet: Asset[]) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateString = oneYearAgo.toISOString().split('T')[0];

  let totalWalletPrediction = 0;
  let totalInvested = 0;
  const assetsDetails = [];

  for (const item of wallet) {
    const tickerStr = item.ticker.toUpperCase();
    const qty = item.quantity;
    const pm = item.precoMedio || 0;

    const { data, error } = await supabase
      .from('dividends')
      .select('amount')
      .eq('ticker', tickerStr)
      .gte('payment_date', dateString);

    if (error) throw error;

    const totalPerShare = (data || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
    const projectedTotal = totalPerShare * qty;

    let yoc = 0;
    if (pm > 0) {
      yoc = (totalPerShare / pm) * 100;
    }

    totalWalletPrediction += projectedTotal;
    totalInvested += pm * qty;

    assetsDetails.push({
      ticker: tickerStr,
      quantity: qty,
      precoMedio: pm,
      dataCompra: item.dataCompra || null,
      projectedDividendPerShare: Number(totalPerShare.toFixed(4)),
      projectedTotal: Number(projectedTotal.toFixed(2)),
      yieldOnCost: Number(yoc.toFixed(2))
    });
  }

  let walletYoc = 0;
  if (totalInvested > 0) {
    walletYoc = (totalWalletPrediction / totalInvested) * 100;
  }

  return {
    totalInvestido: Number(totalInvested.toFixed(2)),
    totalWalletPrediction: Number(totalWalletPrediction.toFixed(2)),
    walletYieldOnCost: Number(walletYoc.toFixed(2)),
    assets: assetsDetails,
    message: `Com base nos últimos 12 meses, sua carteira com custo de R$ ${totalInvested.toFixed(2)} renderia aproximadamente R$ ${totalWalletPrediction.toFixed(2)} em 1 ano (YOC de ${walletYoc.toFixed(2)}%).`
  };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { ticker, quantity, precoMedio } = req.query;

    if (!ticker || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Os parâmetros "ticker" e "quantity" são obrigatórios.'
      });
    }

    const tickerStr = (ticker as string).toUpperCase();
    const qty = parseInt(quantity as string, 10);
    const pm = precoMedio ? parseFloat(precoMedio as string) : 0;

    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A quantidade deve ser um número inteiro maior que zero.'
      });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateString = oneYearAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('dividends')
      .select('amount')
      .eq('ticker', tickerStr)
      .gte('payment_date', dateString);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao processar a previsão.',
        details: error.message
      });
    }

    const totalPerShare = (data || []).reduce((acc, curr) => acc + Number(curr.amount), 0);
    const projectedTotal = totalPerShare * qty;

    let yoc = 0;
    if (pm > 0) {
      yoc = (totalPerShare / pm) * 100;
    }

    return res.status(200).json({
      success: true,
      data: {
        ticker: tickerStr,
        quantity: qty,
        precoMedio: pm,
        projectedDividendPerShare: Number(totalPerShare.toFixed(4)),
        projectedTotal: Number(projectedTotal.toFixed(2)),
        yieldOnCost: Number(yoc.toFixed(2)),
        message: `Com base nos últimos 12 meses, suas ${qty} ações da ${tickerStr} renderiam aproximadamente R$ ${projectedTotal.toFixed(2)} em 1 ano${pm > 0 ? ` (YOC: ${yoc.toFixed(2)}%)` : ''}.`
      },
      message: 'Previsão calculada com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar a previsão.',
      details: err.message
    });
  }
});

router.post('/wallet', async (req: Request, res: Response) => {
  try {
    const { wallet }: { wallet: Asset[] } = req.body;

    if (!wallet || !Array.isArray(wallet) || wallet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'O corpo da requisição deve conter um array "wallet" válido com os ativos.'
      });
    }

    for (const item of wallet) {
      if (
        !item.ticker ||
        typeof item.ticker !== 'string' ||
        !item.quantity ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Cada item no array "wallet" deve ter "ticker" (string) e "quantity" (número > 0).'
        });
      }
    }

    const prediction = await calculateWalletPrediction(wallet);

    return res.status(200).json({
      success: true,
      data: prediction,
      message: 'Previsão da carteira calculada com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar a previsão da carteira.',
      details: err.message
    });
  }
});

router.get('/wallet/:walletId', async (req: AuthRequest, res: Response) => {
  try {
    const { walletId } = req.params;
    const userId = req.userId;

    const walletRepository = AppDataSource.getRepository(Wallet);
    const savedWallet = await walletRepository.findOneOrFail({
      where: { id: walletId, user: { id: userId as string } }
    });

    const prediction = await calculateWalletPrediction(savedWallet.assets);

    return res.status(200).json({
      success: true,
      data: prediction,
      message: 'Previsão da carteira salva calculada com sucesso.'
    });
  } catch (err: any) {
    if (err.name === 'EntityNotFoundError') {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao processar a previsão da carteira salva.',
      details: err.message
    });
  }
});

export default router;