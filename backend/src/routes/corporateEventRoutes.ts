import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { CorporateEvent } from '../models/CorporateEvent';

const router = Router();

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
      order: { last_date_prior: 'DESC' }
    });

    const bffResponse = events.map(evento => ({
      ativo: evento.ticker,
      tipo: evento.type,
      fator: evento.factor,
      dataCom: evento.last_date_prior
    }));

    return res.status(200).json({
      success: true,
      data: bffResponse,
      message: 'Eventos corporativos recuperados com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar eventos corporativos.',
      details: err.message
    });
  }
});

export default router;