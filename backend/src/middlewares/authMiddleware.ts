import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos a interface do Express para podermos injetar o ID do usuário na requisição
export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Busca o cabeçalho de autorização na requisição do Angular
  const authHeader = req.headers.authorization;

  // Verifica se o Angular mandou o cabeçalho e se ele começa com 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // Separa a palavra 'Bearer' do token real (ex: "Bearer eyJhbGciOi...")
  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui';
    const decoded = jwt.verify(token, jwtSecret) as { id: string };

    req.userId = decoded.id; // Repassa o ID do usuário para a próxima rota (ex: dashboardRoutes)
    return next(); // Libera a catraca! A requisição pode seguir para a rota original
  } catch (err) {
    return res.status(401).json({ error: 'Acesso negado. Token expirado ou inválido.' });
  }
};