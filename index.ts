import "reflect-metadata"; // Exigência do TypeORM, deve ser a primeira importação
import { fetchAndSaveDividends } from './brapi/brapiService';
import app from './invix/app';
import { AppDataSource } from './config/data-source';

// Ponto de entrada principal do seu backend
async function main() {
  const PORT = process.env.PORT || 3000;

  try {
    console.log('Conectando ao banco de dados com TypeORM...');
    await AppDataSource.initialize();
    console.log('Banco de dados conectado e sincronizado com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    return; // Para a execução se o banco não conectar
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse no navegador: http://localhost:${PORT}`);
    console.log(`API de dividendos: http://localhost:${PORT}/api/dividends`);
  });

  // --- SCRIPT DE ATUALIZAÇÃO DA BRAPI (Comentado para não rodar automaticamente) ---
  // const tickers = ['PETR4', 'VALE3', 'ITUB4'];
  // for (const ticker of tickers) {
  //   await fetchAndSaveDividends(ticker);
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  // }
  // console.log('\nFinalizado! Todo o lote de ações foi processado com sucesso.');
}

main();