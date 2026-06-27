import express from 'express';
import cors from 'cors';
import dividendRoutes from '@/routes/dividendRoutes';
import { syncRoutes } from '@/routes/sync.routes';
import predictionRoutes from '@/routes/predictionRoutes';
import userRoutes from '@/routes/userRoutes';
import walletRoutes from '@/routes/walletRoutes';
import corporateEventRoutes from '@/routes/corporateEventRoutes';
import dashboardRoutes from '@/routes/dashboardRoutes';
import authRoutes from '@/routes/authRoutes';
import analyticsRoutes from '@/routes/analyticsRoutes';
import { authMiddleware } from '@/middlewares/authMiddleware';

const app = express();

// Middlewares globais
const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: '*', // Libera para qualquer origem no MVP, evitando problemas de barra(/) no final da URL ou domínios diferentes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Segredo para o Token JWT passar!
}));
app.use(express.json()); // Permite que a API receba JSON no body das requisições

// Registra as rotas

// Rotas PÚBLICAS (Abertas)
app.use('/api/auth', authRoutes); // Rota de Login e Autenticação!
app.use('/api/dividends', dividendRoutes); 
app.use('/api/corporate-events', corporateEventRoutes); 
app.use('/api', syncRoutes); 

// Rotas PRIVADAS (Fechadas com o AuthMiddleware)
app.use('/api/dashboard', authMiddleware, dashboardRoutes); // Rota BFF para a tela de Dashboard
app.use('/api/wallets', authMiddleware, walletRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes); // Rota BFF para Gráficos e Metas
app.use('/api/predictions', authMiddleware, predictionRoutes); // Nova rota de previsões!
app.use('/api/users', authMiddleware, userRoutes);

// Rota base para testar se a API está online
app.get('/', (req, res) => {
  res.json({ message: 'API do Invix rodando com sucesso!' });
});

export default app;