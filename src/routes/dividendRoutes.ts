import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

const router = Router();

// Rota GET /api/dividends
// Aceita um filtro opcional pela URL, ex: /api/dividends?ticker=PETR4
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.query;
    
    // Prepara a query ordenando pela data de pagamento (mais recentes primeiro)
    let query = supabase.from('dividends').select('*').order('payment_date', { ascending: false });

    if (ticker) {
      query = query.eq('ticker', (ticker as string).toUpperCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    // Padrão BFF: Mapeando (traduzindo) os dados do banco para o formato que a UI no Angular espera
    const bffResponse = data.map((item: any) => ({
      ativo: item.ticker,
      valor: item.amount,
      tipo: item.type,
      dataPagamento: item.payment_date,
      dataCom: item.last_date_prior
    }));

    res.json(bffResponse); // Retorna os dados mastigados e traduzidos para o Frontend
  } catch (err: any) {
    res.status(500).json({ error: 'Erro interno ao buscar dividendos', details: err.message });
  }
});

export default router;