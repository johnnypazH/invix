import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import bcrypt from 'bcrypt';

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

export default router;