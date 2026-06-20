import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está cadastrado.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    await userRepository.save(user);

    return res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email }
      },
      message: 'Usuário criado com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário.',
      details: error.message
    });
  }
});

router.put('/goal', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { objetivoMensal } = req.body;

    if (objetivoMensal === undefined || typeof objetivoMensal !== 'number' || objetivoMensal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O campo "objetivoMensal" é obrigatório e deve ser um número maior que zero.'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    user.objetivoMensal = objetivoMensal;
    await userRepository.save(user);

    return res.json({
      success: true,
      data: {
        objetivoMensal: user.objetivoMensal
      },
      message: 'Meta mensal atualizada com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar a meta mensal.',
      details: error.message
    });
  }
});

export default router;