import { Router } from 'express';
import { syncDividendsController } from '@/controllers/sync.controller';
import { runManualSync } from './syncCron';

const syncRoutes = Router();

syncRoutes.post('/sync/dividends', syncDividendsController);

syncRoutes.get('/sync/now', (req, res) => {
  runManualSync();

  return res.status(202).json({
    success: true,
    data: null,
    message: '🚀 Sincronização iniciada em background. Acompanhe o progresso no terminal do backend.'
  });
});

export { syncRoutes };