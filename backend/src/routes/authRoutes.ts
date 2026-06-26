import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, e-mail e senha são obrigatórios.'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOneBy({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    await userRepository.save(user);

    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      message: 'Cadastro realizado com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao realizar o cadastro.',
      details: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios.'
      });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    let isPasswordValid = false;
    if (user.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      message: 'Login realizado com sucesso.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao realizar login.',
      details: err.message
    });
  }
});

export default router;