import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/users - Criar um novo usuário
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Verifica se o e-mail já existe no banco
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
      return;
    }

    // Criptografa a senha antes de salvar no banco
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria a instância do usuário e salva
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword; // Senha agora está 100% segura!

    await userRepository.save(user);

    // Retorna os dados do usuário criado (escondendo a senha por segurança)
    res.status(201).json({ message: 'Usuário criado com sucesso!', user: { id: user.id, name: user.name, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar usuário', details: error.message });
  }
});

// PUT /api/users/goal - Atualizar a meta de independência financeira do usuário
router.put('/goal', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId; // Vem do token JWT
    const { objetivoMensal } = req.body;

    if (objetivoMensal === undefined || typeof objetivoMensal !== 'number' || objetivoMensal <= 0) {
      res.status(400).json({ error: 'O campo "objetivoMensal" é obrigatório e deve ser um número maior que zero.' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    user.objetivoMensal = objetivoMensal;
    await userRepository.save(user); // TypeORM atualiza o registro no banco

    res.json({ message: 'Meta mensal atualizada com sucesso!', objetivoMensal: user.objetivoMensal });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar a meta mensal', details: error.message });
  }
});

export default router;