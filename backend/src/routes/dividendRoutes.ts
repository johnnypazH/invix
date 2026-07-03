import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import axios from 'axios';

const router = Router();

const traduzirSetor = (setorIngles: string): string => {
  const mapaSetores: Record<string, string> = {
    'Finance': 'Financeiro',
    'Energy Minerals': 'Minerais Energéticos',
    'Utilities': 'Utilidade Pública',
    'Non-Energy Minerals': 'Minerais Não Energéticos',
    'Commercial Services': 'Serviços Comerciais',
    'Retail Trade': 'Comércio Varejista',
    'Technology Services': 'Tecnologia da Informação',
    'Electronic Technology': 'Tecnologia Eletrônica',
    'Health Technology': 'Tecnologia em Saúde',
    'Health Services': 'Serviços de Saúde',
    'Consumer Non-Durables': 'Bens de Consumo (Não-Duráveis)',
    'Consumer Durables': 'Bens de Consumo (Duráveis)',
    'Producer Manufacturing': 'Bens Industriais',
    'Process Industries': 'Indústria de Transformação',
    'Industrial Services': 'Serviços Industriais',
    'Transportation': 'Transportes',
    'Communications': 'Comunicações'
  };
  return mapaSetores[setorIngles] || setorIngles;
};

router.get('/ativos', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('dividends')
      .select('ticker, name, sector');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar ativos no Supabase.',
        details: error.message
      });
    }

    const uniqueAtivosMap = new Map<string, { ticker: string; nome: string; sector: string }>();
    (data || []).forEach((item: any) => {
      if (item.ticker) {
        const tickerUpper = item.ticker.toUpperCase();
        if (!uniqueAtivosMap.has(tickerUpper)) {
          uniqueAtivosMap.set(tickerUpper, {
            ticker: tickerUpper,
            nome: item.name || tickerUpper,
            sector: item.sector || 'Outros'
          });
        }
      }
    });

    const uniqueAtivos = Array.from(uniqueAtivosMap.values());
    const tickersArray = uniqueAtivos.map(a => a.ticker);

    let brapiMap = new Map<string, number>();
    if (tickersArray.length > 0) {
      try {
        const brapiToken = process.env.BRAPI_TOKEN;
        const tickersString = tickersArray.join(',');
        const response = await axios.get(`https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`);
        const brapiResults = response.data.results || [];
        brapiResults.forEach((item: any) => {
          brapiMap.set(item.symbol.toUpperCase(), item.regularMarketPrice || 0);
        });
      } catch (err) {
        console.error('Erro ao buscar cotações na Brapi para ativos disponíveis:', err);
      }
    }

    const result = uniqueAtivos.map(ativo => ({
      ticker: ativo.ticker,
      nome: ativo.nome,
      setor: traduzirSetor(ativo.sector),
      precoAtual: brapiMap.get(ativo.ticker) || 0
    }));

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Ativos disponíveis recuperados com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar ativos disponíveis.',
      details: err.message
    });
  }
});

router.get('/quote/:ticker', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    const tickerUpper = ticker.toUpperCase();
    const brapiToken = process.env.BRAPI_TOKEN;

    const response = await axios.get(`https://brapi.dev/api/quote/${tickerUpper}?token=${brapiToken}`);
    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error(`Erro ao buscar cotação de ${req.params.ticker} na Brapi:`, err.message);
    return res.status(err.response?.status || 500).json({
      success: false,
      message: `Erro ao buscar cotação do ativo ${req.params.ticker} na Brapi.`,
      details: err.response?.data || err.message
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.query;

    let query = supabase
      .from('dividends')
      .select('*')
      .order('payment_date', { ascending: false });

    if (ticker) {
      query = query.eq('ticker', (ticker as string).toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar dividendos.',
        details: error.message
      });
    }

    const bffResponse = (data || []).map((item: any) => ({
      ativo: item.ticker,
      valor: Number(item.amount),
      tipo: item.type,
      dataPagamento: item.payment_date,
      dataCom: item.last_date_prior
    }));

    return res.status(200).json({
      success: true,
      data: bffResponse,
      message: 'Dividendos recuperados com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar dividendos.',
      details: err.message
    });
  }
});

export default router;