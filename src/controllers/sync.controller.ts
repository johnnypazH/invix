import { Request, Response } from 'express';
import { fetchAndSaveDividends } from '@/services/brapi/brapiService';

export const syncDividendsController = async (req: Request, res: Response) => {
  const tickers = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4'];

  try {
    console.log('Iniciando sincronização manual de dividendos...');

    for (const ticker of tickers) {
      await fetchAndSaveDividends(ticker);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return res.status(200).json({
      success: true,
      data: { tickersProcessados: tickers },
      message: 'Sincronização de dividendos concluída com sucesso para todos os tickers.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro durante a sincronização.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};