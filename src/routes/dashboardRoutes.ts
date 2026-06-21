import { Router, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';

const router = Router();

// Cache em memória para evitar requisições repetidas lentas na Brapi (TTL de 2 minutos)
const quoteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 2 * 60 * 1000;

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallets = await walletRepository.find({
      where: { user: { id: userId } }
    });

    const userTickers = new Set<string>();
    let totalAtivos = 0;

    wallets.forEach(w => {
      let ativos = w.assets || [];
      if (typeof ativos === 'string') {
        try { ativos = JSON.parse(ativos); } catch (e) {}
      }
      if (Array.isArray(ativos)) {
        totalAtivos += ativos.length;
        ativos.forEach((ativo: any) => {
          if (ativo.ticker) {
            userTickers.add(ativo.ticker.toUpperCase());
          }
        });
      }
    });

    const tickersArray = Array.from(userTickers);

    let recentDividends: any[] = [];
    if (tickersArray.length > 0) {
      const { data, error } = await supabase
        .from('dividends')
        .select('ticker, amount, payment_date')
        .in('ticker', tickersArray)
        .order('payment_date', { ascending: false })
        .limit(15);
      if (error) throw error;
      recentDividends = data || [];
    }

    let brapiMap = new Map<string, number>();
    if (tickersArray.length > 0) {
      const now = Date.now();
      const tickersToFetch: string[] = [];

      tickersArray.forEach((ticker: string) => {
        const cached = quoteCache.get(ticker);
        if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
          brapiMap.set(ticker, cached.data.regularMarketPrice || 0);
        } else {
          tickersToFetch.push(ticker);
        }
      });

      if (tickersToFetch.length > 0) {
        try {
          const brapiToken = process.env.BRAPI_TOKEN;
          const tickersString = tickersToFetch.join(',');
          const response = await axios.get(`https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`);
          const brapiResults = response.data.results || [];
          brapiResults.forEach((item: any) => {
            if (item && item.symbol) {
              const tickerUpper = item.symbol.toUpperCase();
              const price = item.regularMarketPrice || 0;
              brapiMap.set(tickerUpper, price);
              quoteCache.set(tickerUpper, {
                data: item,
                timestamp: now
              });
            }
          });
        } catch (err) {
          console.error('Erro ao buscar preços na Brapi para o Dashboard:', err);
        }
      }
    }

    let dividendos12mMap = new Map<string, number>();
    if (tickersArray.length > 0) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dateString12m = oneYearAgo.toISOString().split('T')[0];

      const { data: div12mData, error: div12mError } = await supabase
        .from('dividends')
        .select('ticker, amount')
        .in('ticker', tickersArray)
        .gte('payment_date', dateString12m);

      if (!div12mError && div12mData) {
        div12mData.forEach((row: any) => {
          const t = row.ticker.toUpperCase();
          const amt = Number(row.amount);
          dividendos12mMap.set(t, (dividendos12mMap.get(t) || 0) + amt);
        });
      }
    }

    let patrimonioTotal = 0;
    let totalInvestido = 0;
    let dividendosTotal = 0;
    const todosAtivos: any[] = [];

    wallets.forEach(w => {
      let ativos = w.assets || [];
      if (typeof ativos === 'string') {
        try { ativos = JSON.parse(ativos); } catch (e) {}
      }
      if (Array.isArray(ativos)) {
        ativos.forEach((ativo: any) => {
          const qty = ativo.quantidade || ativo.quantity || 0;
          const pm = ativo.precoMedio || 0;
          const precoAtual = brapiMap.get(ativo.ticker.toUpperCase()) || pm;
          const divPerShare = dividendos12mMap.get(ativo.ticker.toUpperCase()) || 0;

          const custo = qty * pm;
          const valor = qty * precoAtual;
          const proventos = qty * divPerShare;

          totalInvestido += custo;
          patrimonioTotal += valor;
          dividendosTotal += proventos;

          // Evita duplicar tickers no mesmo dashboard consolidando se aparecer em mais de uma carteira
          const existente = todosAtivos.find(a => a.ticker === ativo.ticker.toUpperCase());
          if (existente) {
            existente.quantidade += qty;
            existente.custoTotal += custo;
            existente.valorTotal += valor;
            existente.proventos12m += proventos;
            existente.precoMedio = existente.quantidade > 0 ? (existente.custoTotal / existente.quantidade) : 0;
            existente.precoAtual = precoAtual; // Atualiza com a cotação mais recente
          } else {
            todosAtivos.push({
              ticker: ativo.ticker.toUpperCase(),
              quantidade: qty,
              precoMedio: pm,
              precoAtual: precoAtual,
              custoTotal: custo,
              valorTotal: valor,
              proventos12m: proventos,
              carteiraNome: w.name
            });
          }
        });
      }
    });

    const resultadoAcumulado = patrimonioTotal + dividendosTotal - totalInvestido;

    const dashboardResponse = {
      success: true,
      data: {
        saudacao: `Olá, ${user.name.split(' ')[0]}!`,
        totalInvestido: Number(totalInvestido.toFixed(2)),
        patrimonioTotal: Number(patrimonioTotal.toFixed(2)),
        dividendosAcumulados: Number(dividendosTotal.toFixed(2)),
        ganhoTotal: Number(resultadoAcumulado.toFixed(2)),
        totalAtivos,
        carteiras: wallets.map(w => ({
          id: w.id,
          nome: w.name,
          descricao: w.description || ''
        })),
        ativos: todosAtivos,
        feedAtividadesRecentes: recentDividends.map((item: any) => ({
          ticker: item.ticker,
          amount: item.amount,
          payment_date: item.payment_date
        }))
      }
    };

    return res.json(dashboardResponse);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar os dados do Dashboard.',
      details: err.message
    });
  }
});

export default router;