import { Router } from 'express';
import { syncDividendsController } from '@/controllers/sync.controller';

const syncRoutes = Router();

// POST é mais adequado para ações que modificam/disparam processos no servidor
syncRoutes.post('/sync/dividends', syncDividendsController);

export { syncRoutes };