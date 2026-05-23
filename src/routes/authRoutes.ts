import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/register - Rota de Cadastro (Sign Up)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Verifica se o e-mail já existe na base (Regra 1 cumprida)
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    // Criptografa a senha antes de salvar (Regra 2 cumprida)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria a instância do usuário e salva no banco
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    await userRepository.save(user);

    // Gera o Token JWT para o usuário já entrar logado
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });

    // Retorna EXATAMENTE o contrato que o Front-end pediu com Status 201
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno ao realizar o cadastro', details: error.message });
  }
});

// POST /api/auth/login - Rota de Login (BFF)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    // Se o usuário não existir
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verifica se a senha bate (suporta tanto bcrypt quanto o seu usuário antigo em texto puro)
    let isPasswordValid = false;
    if (user.password.startsWith('$2b$')) {
      // Senha criptografada com bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Senha em texto puro (daquela vez que testamos antes de instalar o bcrypt)
      isPasswordValid = (password === user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gera o Token JWT (O ideal é ter essa chave no seu .env)
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' }); // Token vale por 7 dias

    // Retorna EXATAMENTE o contrato que o Front-end pediu
    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno ao realizar login', details: err.message });
  }
});

export default router;