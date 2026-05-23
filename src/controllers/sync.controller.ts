import { Request, Response } from 'express';
import { fetchAndSaveDividends } from '@/services/brapi/brapiService';

export const syncDividendsController = async (req: Request, res: Response) => {
  // No futuro, você pode pegar os tickers de uma tabela ou do corpo da requisição
  const tickers = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4']; 

  try {
    console.log('Iniciando sincronização manual de dividendos...');
    
    // Executa a busca para cada ticker em sequência
    for (const ticker of tickers) {
      await fetchAndSaveDividends(ticker);
      // Pequena pausa para não sobrecarregar a API externa
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }

    return res.status(200).json({ message: 'Sincronização de dividendos concluída com sucesso para todos os tickers.' });
  } catch (error) {
    return res.status(500).json({ message: 'Ocorreu um erro durante a sincronização.', error: error instanceof Error ? error.message : String(error) });
  }
};