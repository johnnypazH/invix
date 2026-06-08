import cron from 'node-cron';
import { AppDataSource } from '../config/data-source';
import { Wallet } from '../models/Wallet';
import { fetchAndSaveDividends } from '../services/brapi/brapiService';

export function startCronJobs() {
  // Agenda para rodar todo dia às 02:00 da manhã (Madrugada)
  // Formato: Minuto Hora Dia Mês DiaDaSemana
  cron.schedule('0 2 * * *', async () => {
    console.log('⏳ [CRON] Iniciando rotina de sincronização de dividendos na Brapi...');
    
    try {
      const walletRepository = AppDataSource.getRepository(Wallet);
      const wallets = await walletRepository.find();
      
      // Extrai todos os tickers únicos de todas as carteiras de todos os usuários
      const tickersSet = new Set<string>();
      wallets.forEach(w => {
        let ativos = w.assets || [];
        if (typeof ativos === 'string') {
          try { ativos = JSON.parse(ativos); } catch (e) {}
        }
        if (Array.isArray(ativos)) {
          ativos.forEach((ativo: any) => {
            if (ativo.ticker) tickersSet.add(ativo.ticker.toUpperCase());
          });
        }
      });

      const tickersArray = Array.from(tickersSet);
      console.log(`📊 [CRON] Encontrados ${tickersArray.length} ativos únicos nas carteiras. Atualizando...`);

      // Atualiza um por um com uma pausa de 2 segundos para não derrubar a Brapi (Rate Limit)
      for (const ticker of tickersArray) {
        await fetchAndSaveDividends(ticker);
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      }

      console.log('✅ [CRON] Sincronização de dividendos concluída com sucesso!');
    } catch (error) {
      console.error('❌ [CRON] Erro durante a sincronização:', error);
    }
  });

  console.log('🕒 Rotinas automáticas (Cron Jobs) ativadas!');
}