import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { CorporateEvent } from '../models/CorporateEvent';

const router = Router();

// Rota GET /api/corporate-events
// Aceita um filtro opcional pela URL, ex: /api/corporate-events?ticker=ITSA4
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.query;
    const repository = AppDataSource.getRepository(CorporateEvent);

    let whereClause = {};
    if (ticker) {
      whereClause = { ticker: (ticker as string).toUpperCase() };
    }

    const events = await repository.find({
        where: whereClause,
        order: { last_date_prior: 'DESC' } // Ordena do mais recente para o mais antigo
    });

    // Padrão BFF: Traduzindo as colunas do banco de dados para a interface do Angular
    const bffResponse = events.map(evento => ({
        ativo: evento.ticker,
        tipo: evento.type, // "DESDOBRAMENTO", "BONIFICACAO", etc.
        fator: evento.factor,
        dataCom: evento.last_date_prior
    }));

    res.json(bffResponse);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro interno ao buscar eventos corporativos', details: err.message });
  }
});

export default router;