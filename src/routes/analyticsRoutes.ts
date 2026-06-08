import { Router, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Wallet } from '../models/Wallet';
import { User } from '../models/User';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';

const router = Router();

// Rota GET /api/analytics
// Recebe um query param opcional para a meta: /api/analytics?objetivoMensal=10000
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const walletId = req.query.walletId as string;

    // Busca o usuário para pegar a meta salva no banco (fallback para 5000 caso não exista)
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });
    const metaSalva = user?.objetivoMensal || 5000;

    // Se o Front mandar na URL, usa da URL. Se não, usa a do Banco de Dados!
    const objetivoMensalQuery = req.query.objetivoMensal ? Number(req.query.objetivoMensal) : metaSalva;

    const walletRepository = AppDataSource.getRepository(Wallet);
    
    // Constrói a cláusula WHERE dinamicamente (Filtro opcional de carteira)
    const whereClause: any = { user: { id: userId as string } };
    if (walletId) {
      whereClause.id = walletId;
    }

    const wallets = await walletRepository.find({
      where: whereClause
    });

    const userTickers = new Set<string>();
    const ativosList: any[] = [];

    wallets.forEach(w => {
      let ativos = w.assets || [];
      if (typeof ativos === 'string') {
        try { ativos = JSON.parse(ativos); } catch (e) {}
      }
      if (Array.isArray(ativos)) {
        ativos.forEach((ativo: any) => {
          ativosList.push(ativo);
          if (ativo.ticker) {
            userTickers.add(ativo.ticker.toUpperCase());
          }
        });
      }
    });

    const tickersArray = Array.from(userTickers);

    // 1. Busca os preços atuais na Brapi para calcular Valor Total por Setor
    let brapiMap = new Map();
    if (tickersArray.length > 0) {
      try {
        const brapiToken = process.env.BRAPI_TOKEN;
        const tickersString = tickersArray.join(',');
        const response = await axios.get(`https://brapi.dev/api/quote/${tickersString}?token=${brapiToken}`);
        const brapiResults = response.data.results || [];
        brapiResults.forEach((item: any) => brapiMap.set(item.symbol, item.regularMarketPrice || 0));
      } catch (err) {
        console.error('Erro ao buscar preços na Brapi para o Analytics:', err);
      }
    }

    let patrimonioTotal = 0;
    const setorMap = new Map<string, number>();

    ativosList.forEach((ativo: any) => {
      const qty = ativo.quantidade || ativo.quantity || 0;
      const pm = ativo.precoMedio || 0;
      const precoAtual = brapiMap.get(ativo.ticker) || pm; 
      const setor = ativo.setor || 'Outros';

      const valorAtivo = qty * precoAtual;
      patrimonioTotal += valorAtivo;

      setorMap.set(setor, (setorMap.get(setor) || 0) + valorAtivo);
    });

    const distribuicaoPorSetor = Array.from(setorMap.entries()).map(([setor, valor]) => ({
      setor,
      valorTotal: Number(valor.toFixed(2)),
      percentual: patrimonioTotal > 0 ? Number(((valor / patrimonioTotal) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    // 2. Histórico de Dividendos por Mês (Últimos 12 meses)
    const historicoDividendosMes: { mes: string, valor: number }[] = [];
    let dividendosAnualTotal = 0;

    if (tickersArray.length > 0) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setDate(1); // Volta pro primeiro dia do mês de 1 ano atrás
      const dateString12m = oneYearAgo.toISOString().split('T')[0];

      const { data: divData, error: divError } = await supabase
        .from('dividends')
        .select('ticker, amount, payment_date')
        .in('ticker', tickersArray)
        .gte('payment_date', dateString12m);

      if (!divError && divData) {
        const dividendosPorAcaoMes = new Map<string, Map<string, number>>();

        divData.forEach((row: any) => {
          const t = row.ticker.toUpperCase();
          const amt = Number(row.amount);
          const mes = row.payment_date.substring(0, 7); // Pega 'YYYY-MM'

          if (!dividendosPorAcaoMes.has(mes)) {
            dividendosPorAcaoMes.set(mes, new Map<string, number>());
          }
          const acaoMap = dividendosPorAcaoMes.get(mes)!;
          acaoMap.set(t, (acaoMap.get(t) || 0) + amt);
        });

        // Gera a lista dos últimos 12 meses certinhos em ordem cronológica
        const mesesArray = [];
        const hoje = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            mesesArray.push(d.toISOString().substring(0, 7));
        }

        mesesArray.forEach(mes => {
           let valorMes = 0;
           const acoesNoMes = dividendosPorAcaoMes.get(mes);
           
           if (acoesNoMes) {
               ativosList.forEach((ativo: any) => {
                  const t = ativo.ticker.toUpperCase();
                  const qty = ativo.quantidade || ativo.quantity || 0;
                  const divPerShare = acoesNoMes.get(t) || 0;
                  valorMes += (divPerShare * qty);
               });
           }
           
           historicoDividendosMes.push({ mes, valor: Number(valorMes.toFixed(2)) });
           dividendosAnualTotal += valorMes;
        });
      }
    }

    // 3. Metas (Independência Financeira)
    const atualMensal = dividendosAnualTotal / 12; // Média mensal de recebimentos baseada no último ano
    const percentualConcluido = objetivoMensalQuery > 0 ? (atualMensal / objetivoMensalQuery) * 100 : 0;

    const bffResponse = {
      distribuicaoPorSetor,
      historicoDividendosMes,
      metas: {
        independenciaFinanceira: {
          objetivoMensal: objetivoMensalQuery,
          atualMensal: Number(atualMensal.toFixed(2)),
          percentualConcluido: Number(percentualConcluido.toFixed(2))
        }
      }
    };

    res.json(bffResponse);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao carregar dados do Analytics', details: err.message });
  }
});

export default router;