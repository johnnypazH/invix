import { Router, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';

const router = Router();

// Rota GET /api/dashboard
// Esta rota age como um BFF puro: ela junta dados de vários lugares diferentes
// e devolve um único objeto pronto para o Angular desenhar a tela de Dashboard.
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId; // AGORA VEM DIRETO DO TOKEN JWT! 100% Seguro.

    // 1. Busca os dados do usuário no TypeORM
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // 2. Busca as carteiras que pertencem a esse usuário
    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallets = await walletRepository.find({
      where: { user: { id: userId } }
    });

    // 3. Extrai todos os tickers únicos das carteiras do usuário
    const userTickers = new Set<string>();
    wallets.forEach(w => {
      let ativos = w.assets || [];
      // Segurança caso os ativos venham como string do banco
      if (typeof ativos === 'string') {
        try { ativos = JSON.parse(ativos); } catch (e) {}
      }
      if (Array.isArray(ativos)) {
        ativos.forEach((ativo: any) => {
          if (ativo.ticker) {
            userTickers.add(ativo.ticker.toUpperCase());
          }
        });
      }
    });
    const tickersArray = Array.from(userTickers);

    // 4. Busca os últimos dividendos baseados APENAS nos tickers da carteira do usuário
    let recentDividends: any[] = [];
    if (tickersArray.length > 0) {
      const { data, error } = await supabase
        .from('dividends')
        .select('ticker, amount, payment_date')
        .in('ticker', tickersArray) // O pulo do gato!
        .order('payment_date', { ascending: false })
        .limit(15);
      if (error) throw error;
      recentDividends = data || [];
    }

    // 5. Busca as cotações atuais na Brapi para calcular o Patrimônio e Lucro
    let brapiMap = new Map();
    if (tickersArray.length > 0) {
      try {
        const brapiToken = process.env.BRAPI_TOKEN;
        const tickersString = tickersArray.join(',');
        const response = await axios.get(`https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`);
        const brapiResults = response.data.results || [];
        brapiResults.forEach((item: any) => brapiMap.set(item.symbol, item.regularMarketPrice || 0));
      } catch (err) {
        console.error('Erro ao buscar preços na Brapi para o Dashboard:', err);
      }
    }

    // 5.5 Busca todos os dividendos dos últimos 12 meses para cálculo do projetado anual
    let dividendos12mMap = new Map<string, number>();
    if (tickersArray.length > 0) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateString12m = oneYearAgo.toISOString().split('T')[0];

      const { data: div12mData, error: div12mError } = await supabase
        .from('dividends')
        .select('ticker, amount')
        .in('ticker', tickersArray)
        .gte('payment_date', dateString12m); // Pega apenas dividendos dos últimos 12 meses
      
      if (!div12mError && div12mData) {
        div12mData.forEach((row: any) => {
          const t = row.ticker.toUpperCase();
          const amt = Number(row.amount);
          dividendos12mMap.set(t, (dividendos12mMap.get(t) || 0) + amt);
        });
      }
    }

    // 6. Calcula o Patrimônio Total e Custo Total de todas as carteiras juntas
    let patrimonioTotal = 0;
    let custoTotal = 0;
    let dividendosTotal = 0;

    wallets.forEach(w => {
      let ativos = w.assets || [];
      if (typeof ativos === 'string') {
        try { ativos = JSON.parse(ativos); } catch (e) {}
      }
      if (Array.isArray(ativos)) {
        ativos.forEach((ativo: any) => {
          const qty = ativo.quantidade || ativo.quantity || 0;
          const pm = ativo.precoMedio || 0;
          // Fallback de segurança: se a Brapi falhar e retornar 0, usamos o preço médio para não zerar o patrimônio na tela
          const precoAtual = brapiMap.get(ativo.ticker) || pm; 
          const divPerShare = dividendos12mMap.get(ativo.ticker.toUpperCase()) || 0;
          
          custoTotal += (qty * pm);
          patrimonioTotal += (qty * precoAtual);
          dividendosTotal += (qty * divPerShare);
        });
      }
    });

    // 7. Monta a resposta EXATAMENTE do jeito que o Angular precisa (BFF)
    const dashboardBffResponse = {
      saudacao: `Olá, ${user.name.split(' ')[0]}!`, // Pega apenas o primeiro nome
      patrimonioTotal: Number(patrimonioTotal.toFixed(2)),
      lucroTotal: Number((patrimonioTotal - custoTotal).toFixed(2)),
      dividendosTotal: Number(dividendosTotal.toFixed(2)),
      // O Angular espera uma lista chamada "carteiras" com id, nome e descricao:
      carteiras: wallets.map(w => ({
        id: w.id,
        nome: w.name,
        descricao: w.description || ''
      })),
      feedDividendos: recentDividends // Mandei de brinde caso você queira por um mural de notícias no HTML depois!
    };

    res.json(dashboardBffResponse);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar os dados do Dashboard', details: err.message });
  }
});

export default router;