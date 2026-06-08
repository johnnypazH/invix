import 'dotenv/config'; // Carrega as variáveis de ambiente
import app from './app';
import { AppDataSource } from './config/data-source';
import { startCronJobs } from './routes/syncCron';

const PORT = process.env.PORT || 3333;

// Primeiro inicializa o banco de dados (TypeORM)
AppDataSource.initialize().then(() => {
  console.log('📦 Banco de dados conectado com sucesso!');
  
  // Ligar o robô das rotinas de madrugada (Cron Jobs)
  startCronJobs();

  // Depois que o banco conectar, inicia o servidor Express
  app.listen(PORT, () => {
    console.log('================================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`   Acesse em: http://localhost:${PORT}`);
    console.log('================================================');
  });
}).catch((error) => {
  console.error('❌ Erro ao conectar no banco de dados:', error);
});