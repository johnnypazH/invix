import { Router, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Wallet } from '../models/Wallet';
import { User } from '../models/User';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const walletId = req.query.walletId as string;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: userId as string });

    const walletRepository = AppDataSource.getRepository(Wallet);
    const whereClause: any = { user: { id: userId as string } };
    if (walletId) {
      whereClause.id = walletId;
    }

    const wallets = await walletRepository.find({ where: whereClause });
    const selectedWallet = walletId ? wallets.find(w => w.id === walletId) : null;
    const metaSalva = selectedWallet?.metaMensal || user?.objetivoMensal || 5000;
    const objetivoMensalQuery = req.query.objetivoMensal ? Number(req.query.objetivoMensal) : metaSalva;

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

    let brapiMap = new Map<string, number>();
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
      const precoAtual = brapiMap.get(ativo.ticker.toUpperCase()) || pm;
      const setor = ativo.setor || 'Outros';

      const valorAtivo = qty * precoAtual;
      patrimonioTotal += valorAtivo;
      setorMap.set(setor, (setorMap.get(setor) || 0) + valorAtivo);
    });

    const distribuicaoPorSetor = Array.from(setorMap.entries())
      .map(([setor, valor]) => ({
        setor,
        valorTotal: Number(valor.toFixed(2)),
        percentual: patrimonioTotal > 0 ? Number(((valor / patrimonioTotal) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    const historicoDividendosMes: { mes: string; valor: number }[] = [];
    let dividendosAnualTotal = 0;
    const dividendosDetalhados: any[] = [];

    let maioresPagadores: { ticker: string; total: number }[] = [];

    if (tickersArray.length > 0) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      oneYearAgo.setDate(1);
      const dateString12m = oneYearAgo.toISOString().split('T')[0];

      const { data: divData, error: divError } = await supabase
        .from('dividends')
        .select('ticker, name, amount, type, payment_date, last_date_prior')
        .in('ticker', tickersArray)
        .gte('payment_date', dateString12m);

      if (!divError && divData) {
        const dividendosPorAcaoMes = new Map<string, Map<string, number>>();
        const pagadoresMap = new Map<string, number>();

        divData.forEach((row: any) => {
          const t = row.ticker.toUpperCase();
          const amt = Number(row.amount);
          const mes = row.payment_date ? row.payment_date.substring(0, 7) : '';

          if (mes) {
            if (!dividendosPorAcaoMes.has(mes)) {
              dividendosPorAcaoMes.set(mes, new Map<string, number>());
            }
            const acaoMap = dividendosPorAcaoMes.get(mes)!;
            acaoMap.set(t, (acaoMap.get(t) || 0) + amt);
          }

          // Encontra a quantidade que o usuário possui desse ativo nas suas carteiras
          let quantidadeTotal = 0;
          ativosList.forEach((ativo: any) => {
            if (ativo.ticker.toUpperCase() === t) {
              quantidadeTotal += ativo.quantidade || ativo.quantity || 0;
            }
          });

          if (quantidadeTotal > 0 && row.payment_date) {
            const totalRecebido = amt * quantidadeTotal;
            dividendosDetalhados.push({
              ticker: t,
              nome: row.name || t,
              valorUnitario: amt,
              tipo: (row.type || 'Dividendo').toUpperCase(),
              dataCom: row.last_date_prior || null,
              dataPagamento: row.payment_date || null,
              quantidade: quantidadeTotal,
              totalRecebido: Number(totalRecebido.toFixed(2))
            });

            // Acumula os dividendos por ativo para o gráfico de Maiores Pagadores
            pagadoresMap.set(t, (pagadoresMap.get(t) || 0) + totalRecebido);
          }
        });

        // Monta o ranking dos maiores pagadores (Top 10)
        maioresPagadores = Array.from(pagadoresMap.entries())
          .map(([ticker, total]) => ({
            ticker,
            total: Number(total.toFixed(2))
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);

        // Ordena por data de pagamento decrescente
        dividendosDetalhados.sort((a, b) => {
          const dateA = a.dataPagamento ? new Date(a.dataPagamento).getTime() : 0;
          const dateB = b.dataPagamento ? new Date(b.dataPagamento).getTime() : 0;
          return dateB - dateA;
        });

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
              valorMes += divPerShare * qty;
            });
          }

          historicoDividendosMes.push({ mes, valor: Number(valorMes.toFixed(2)) });
          dividendosAnualTotal += valorMes;
        });
      }
    }

    const atualMensal = dividendosAnualTotal / 12;
    const percentualConcluido = objetivoMensalQuery > 0 ? (atualMensal / objetivoMensalQuery) * 100 : 0;

    const analyticsData = {
      metaMensal: Number(objetivoMensalQuery.toFixed(2)),
      progressoAtual: Number(atualMensal.toFixed(2)),
      percentualConcluido: Number(percentualConcluido.toFixed(2)),
      distribuicaoPorSetor,
      historicoDividendosMes
    };

    const ativosConsolidados: any[] = [];
    ativosList.forEach((ativo: any) => {
      const qty = ativo.quantidade || ativo.quantity || 0;
      const pm = ativo.precoMedio || 0;
      const t = ativo.ticker.toUpperCase();
      const custo = qty * pm;

      const existente = ativosConsolidados.find(a => a.ticker === t);
      if (existente) {
        existente.quantidade += qty;
        existente.custoTotal += custo;
        existente.precoMedio = existente.quantidade > 0 ? (existente.custoTotal / existente.quantidade) : 0;
      } else {
        ativosConsolidados.push({
          ticker: t,
          nome: ativo.nome || t,
          setor: ativo.setor || 'Outros',
          quantidade: qty,
          precoMedio: pm,
          custoTotal: custo
        });
      }
    });

    ativosConsolidados.forEach(a => {
      a.custoTotal = Number(a.custoTotal.toFixed(2));
      a.precoMedio = Number(a.precoMedio.toFixed(2));
    });

    return res.json({
      success: true,
      data: {
        analytics: analyticsData,
        metas: {
          independenciaFinanceira: {
            metaMensal: analyticsData.metaMensal,
            progressoAtual: analyticsData.progressoAtual,
            percentualConcluido: analyticsData.percentualConcluido
          }
        },
        distribuicaoPorSetor: analyticsData.distribuicaoPorSetor,
        historicoDividendosMes: analyticsData.historicoDividendosMes,
        historicoDividendos: analyticsData.historicoDividendosMes,
        dividendosDetalhados: dividendosDetalhados.slice(0, 15), // Limita aos 15 últimos proventos
        ativos: ativosConsolidados,
        maioresPagadores: maioresPagadores
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar dados do Analytics.',
      details: err.message
    });
  }
});

export default router;