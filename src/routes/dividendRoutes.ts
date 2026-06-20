import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

const router = Router();

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