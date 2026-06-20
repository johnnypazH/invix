import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';
import { supabase } from '../config/supabaseClient';

const router = Router();

const traduzirSetor = (setorIngles: string): string => {
  const mapaSetores: Record<string, string> = {
    'Finance': 'Financeiro',
    'Energy Minerals': 'Minerais Energéticos',
    'Utilities': 'Utilidade Pública',
    'Non-Energy Minerals': 'Minerais Não Energéticos',
    'Commercial Services': 'Serviços Comerciais',
    'Retail Trade': 'Comércio Varejista',
    'Technology Services': 'Tecnologia da Informação',
    'Electronic Technology': 'Tecnologia Eletrônica',
    'Health Technology': 'Tecnologia em Saúde',
    'Health Services': 'Serviços de Saúde',
    'Consumer Non-Durables': 'Bens de Consumo (Não-Duráveis)',
    'Consumer Durables': 'Bens de Consumo (Duráveis)',
    'Producer Manufacturing': 'Bens Industriais',
    'Process Industries': 'Indústria de Transformação',
    'Industrial Services': 'Serviços Industriais',
    'Transportation': 'Transportes',
    'Communications': 'Comunicações'
  };
  return mapaSetores[setorIngles] || setorIngles;
};

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao, metaMensal } = req.body;
    const userId = req.userId;

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O nome da carteira é obrigatório.'
      });
    }

    let metaMensalValidada: number | undefined;
    if (metaMensal !== undefined && metaMensal !== null) {
      const metaNumerica = Number(metaMensal);
      if (!Number.isFinite(metaNumerica) || metaNumerica <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A meta mensal deve ser um número maior que zero.'
        });
      }
      metaMensalValidada = Number(metaNumerica.toFixed(2));
    }

    const userRepository = AppDataSource.getRepository(User);
    const walletRepository = AppDataSource.getRepository(Wallet);
    const user = await userRepository.findOneBy({ id: userId as string });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    const wallet = new Wallet();
    wallet.name = nome.trim();
    wallet.description = descricao?.trim() || '';
    wallet.metaMensal = metaMensalValidada;
    wallet.assets = [];
    wallet.user = user;

    await walletRepository.save(wallet);

    return res.status(201).json({
      success: true,
      data: {
        carteira: {
          id: wallet.id,
          nome: wallet.name,
          descricao: wallet.description || '',
          metaMensal: wallet.metaMensal || null
        }
      },
      message: 'Carteira criada com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao criar carteira.',
      details: error.message
    });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { nome, descricao, metaMensal } = req.body;

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({
        success: false,
        message: 'O nome da carteira é obrigatório.'
      });
    }

    let metaMensalValidada: number | undefined;
    if (metaMensal !== undefined && metaMensal !== null) {
      const metaNumerica = Number(metaMensal);
      if (!Number.isFinite(metaNumerica) || metaNumerica <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A meta mensal deve ser um número maior que zero.'
        });
      }
      metaMensalValidada = Number(metaNumerica.toFixed(2));
    }

    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada ou não pertence ao usuário.'
      });
    }

    wallet.name = nome.trim();
    wallet.description = descricao?.trim() || '';
    wallet.metaMensal = metaMensalValidada !== undefined ? metaMensalValidada : wallet.metaMensal;
    await walletRepository.save(wallet);

    return res.json({
      success: true,
      data: {
        carteira: {
          id: wallet.id,
          nome: wallet.name,
          descricao: wallet.description || '',
          metaMensal: wallet.metaMensal || null
        }
      },
      message: 'Carteira atualizada com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao atualizar a carteira.',
      details: error.message
    });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada ou não pertence ao usuário.'
      });
    }

    await walletRepository.remove(wallet);

    return res.json({
      success: true,
      data: { id },
      message: 'Carteira removida com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover carteira.',
      details: error.message
    });
  }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallets = await walletRepository.find({
      where: { user: { id: userId } }
    });

    return res.json({
      success: true,
      data: {
        carteiras: wallets.map(w => ({
          id: w.id,
          nome: w.name,
          descricao: w.description || ''
        }))
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar carteiras.',
      details: error.message
    });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const walletRepository = AppDataSource.getRepository(Wallet);

    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada.'
      });
    }

    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    let enrichedAssets: any[] = [];
    let patrimonioTotal = 0;
    const setorMap = new Map<string, number>();
    const ativoMap = new Map<string, number>();

    if (ativos.length > 0) {
      const tickers = ativos.map((a: any) => a.ticker).join(',');
      const brapiToken = process.env.BRAPI_TOKEN;

      try {
        const response = await axios.get(`https://brapi.dev/api/quote/${tickers}?token=${brapiToken}`);
        const brapiResults = response.data.results || [];
        const brapiMap = new Map();
        brapiResults.forEach((item: any) => brapiMap.set(item.symbol, item));

        enrichedAssets = ativos.map((ativo: any) => {
          const brapiData = brapiMap.get(ativo.ticker) || {};
          const precoAtual = brapiData.regularMarketPrice || 0;
          const quantidade = ativo.quantity || 0;
          const pm = ativo.precoMedio || 0;
          const setorBanco = ativo.setor && ativo.setor !== 'Outros' ? ativo.setor : null;
          const setor = traduzirSetor(setorBanco || brapiData.sector || 'Outros');
          const nomeBanco = ativo.nome && ativo.nome !== ativo.ticker ? ativo.nome : null;
          const nome = nomeBanco || brapiData.shortName || ativo.ticker;
          const rentabilidadePercentual = pm > 0 && precoAtual > 0 ? Number((((precoAtual - pm) / pm) * 100).toFixed(2)) : 0;
          const rentabilidadeValor = pm > 0 && precoAtual > 0 ? Number(((precoAtual - pm) * quantidade).toFixed(2)) : 0;

          return {
            id: `${wallet.id}-${ativo.ticker}`,
            ticker: ativo.ticker,
            nome,
            setor,
            quantidade,
            precoMedio: pm,
            dataCompra: ativo.dataCompra || null,
            precoAtual,
            rentabilidade: rentabilidadePercentual,
            rentabilidadeValor
          };
        });
      } catch (apiError) {
        console.error('Erro ao buscar cotações na Brapi:', apiError);
        enrichedAssets = ativos.map((ativo: any) => ({
          id: `${wallet.id}-${ativo.ticker}`,
          ticker: ativo.ticker,
          nome: ativo.nome || ativo.ticker,
          setor: traduzirSetor(ativo.setor || 'Outros'),
          quantidade: ativo.quantity || 0,
          precoMedio: ativo.precoMedio || 0,
          dataCompra: ativo.dataCompra || null,
          precoAtual: 0,
          rentabilidade: 0,
          rentabilidadeValor: 0
        }));
      }

      enrichedAssets.forEach((ativo: any) => {
        const precoCalculo = ativo.precoAtual > 0 ? ativo.precoAtual : ativo.precoMedio;
        const valorTotalAtivo = ativo.quantidade * precoCalculo;

        patrimonioTotal += valorTotalAtivo;
        setorMap.set(ativo.setor, (setorMap.get(ativo.setor) || 0) + valorTotalAtivo);
        ativoMap.set(ativo.ticker, (ativoMap.get(ativo.ticker) || 0) + valorTotalAtivo);
      });
    }

    const composicaoPorSetor = Array.from(setorMap.entries())
      .map(([setor, valor]) => ({
        setor,
        valorTotal: Number(valor.toFixed(2)),
        percentual: patrimonioTotal > 0 ? Number(((valor / patrimonioTotal) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    const composicaoPorAtivo = Array.from(ativoMap.entries())
      .map(([ticker, valor]) => ({
        ticker,
        valorTotal: Number(valor.toFixed(2)),
        percentual: patrimonioTotal > 0 ? Number(((valor / patrimonioTotal) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    return res.json({
      success: true,
      data: {
        carteira: {
          id: wallet.id,
          nome: wallet.name,
          descricao: wallet.description || '',
          metaMensal: wallet.metaMensal || null,
          patrimonioTotal: Number(patrimonioTotal.toFixed(2)),
          composicaoPorSetor,
          composicaoPorAtivo,
          assets: enrichedAssets
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar detalhes da carteira.',
      details: error.message
    });
  }
});

router.post('/:id/assets', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const novoAtivo = req.body;

    if (!novoAtivo?.ticker) {
      return res.status(400).json({
        success: false,
        message: 'O ticker do ativo é obrigatório.'
      });
    }

    const tickerFormatado = novoAtivo.ticker.toUpperCase();
    let ativoValido = false;
    let brapiData: any = null;

    try {
      const brapiToken = process.env.BRAPI_TOKEN;
      const response = await axios.get(`https://brapi.dev/api/quote/${tickerFormatado}?token=${brapiToken}`);
      if (response.data.results && response.data.results.length > 0) {
        ativoValido = true;
        brapiData = response.data.results[0];

        const listResponse = await axios.get(`https://brapi.dev/api/quote/list?search=${tickerFormatado}&token=${brapiToken}`);
        if (listResponse.data.stocks && listResponse.data.stocks.length > 0) {
          const stockInfo = listResponse.data.stocks.find((s: any) => s.stock === tickerFormatado) || listResponse.data.stocks[0];
          brapiData.shortName = stockInfo.name || brapiData.shortName;
          brapiData.sector = stockInfo.sector || brapiData.sector;
        }
      }
    } catch (e) {}

    if (!ativoValido) {
      const { data: dbData } = await supabase.from('dividends').select('ticker').eq('ticker', tickerFormatado).limit(1);
      if (dbData && dbData.length > 0) {
        ativoValido = true;
      }
    }

    if (!ativoValido) {
      return res.status(400).json({
        success: false,
        message: `O ativo '${tickerFormatado}' não existe. Verifique o código e tente novamente.`
      });
    }

    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada ou não pertence a este usuário.'
      });
    }

    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    const quantityToAdd = novoAtivo.quantidade || novoAtivo.quantity || 0;
    const precoMedioToAdd = novoAtivo.precoMedio || 0;
    const dataCompraToAdd = novoAtivo.dataCompra || new Date().toISOString().split('T')[0];
    const nomeFront = novoAtivo.nome && novoAtivo.nome !== tickerFormatado ? novoAtivo.nome : null;
    const setorFront = novoAtivo.setor && novoAtivo.setor !== 'Outros' ? novoAtivo.setor : null;
    const setorToAdd = traduzirSetor(setorFront || brapiData?.sector || 'Outros');
    const nomeToAdd = nomeFront || brapiData?.shortName || tickerFormatado;

    const existingAssetIndex = ativos.findIndex((a: any) => a.ticker === tickerFormatado);

    if (existingAssetIndex >= 0) {
      const asset = ativos[existingAssetIndex];
      const currentQty = asset.quantity || 0;
      const currentPrecoMedio = asset.precoMedio || 0;
      const novaQuantidadeTotal = currentQty + quantityToAdd;
      let novoPrecoMedio = 0;

      if (novaQuantidadeTotal > 0) {
        novoPrecoMedio = ((currentQty * currentPrecoMedio) + (quantityToAdd * precoMedioToAdd)) / novaQuantidadeTotal;
      }

      ativos[existingAssetIndex].quantity = novaQuantidadeTotal;
      ativos[existingAssetIndex].precoMedio = Number(novoPrecoMedio.toFixed(2));

      if (nomeFront) {
        ativos[existingAssetIndex].nome = nomeFront;
      } else if (!ativos[existingAssetIndex].nome || ativos[existingAssetIndex].nome === tickerFormatado) {
        ativos[existingAssetIndex].nome = nomeToAdd;
      }

      if (setorFront) {
        ativos[existingAssetIndex].setor = setorFront;
      } else if (!ativos[existingAssetIndex].setor || ativos[existingAssetIndex].setor === 'Outros') {
        ativos[existingAssetIndex].setor = setorToAdd;
      }
    } else {
      ativos.push({
        ticker: tickerFormatado,
        quantity: quantityToAdd,
        precoMedio: precoMedioToAdd,
        dataCompra: dataCompraToAdd,
        nome: nomeToAdd,
        setor: setorToAdd
      });
    }

    wallet.assets = ativos;
    await walletRepository.save(wallet);

    const assetToReturn = {
      id: `${wallet.id}-${tickerFormatado}`,
      ticker: tickerFormatado,
      nome: existingAssetIndex >= 0 ? ativos[existingAssetIndex].nome : nomeToAdd,
      setor: existingAssetIndex >= 0 ? ativos[existingAssetIndex].setor : setorToAdd,
      quantidade: existingAssetIndex >= 0 ? ativos[existingAssetIndex].quantity : quantityToAdd,
      precoMedio: existingAssetIndex >= 0 ? ativos[existingAssetIndex].precoMedio : precoMedioToAdd,
      dataCompra: existingAssetIndex >= 0 ? ativos[existingAssetIndex].dataCompra : dataCompraToAdd
    };

    return res.status(201).json({
      success: true,
      data: { asset: assetToReturn },
      message: 'Ativo adicionado com sucesso.'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao adicionar ativo.',
      details: error.message
    });
  }
});

router.delete('/:id/assets/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const { id, ticker } = req.params;
    const userId = req.userId;

    if (!ticker) {
      return res.status(400).json({
        success: false,
        message: 'O ticker do ativo é obrigatório.'
      });
    }

    const tickerFormatado = ticker.toUpperCase();
    const walletRepository = AppDataSource.getRepository(Wallet);
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Carteira não encontrada ou não pertence a este usuário.'
      });
    }

    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    const ativosFiltrados = ativos.filter((a: any) => a.ticker !== tickerFormatado);
    wallet.assets = ativosFiltrados;
    await walletRepository.save(wallet);

    return res.json({
      success: true,
      data: {
        assets: wallet.assets
      },
      message: `Ativo ${tickerFormatado} removido com sucesso.`
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao remover ativo.',
      details: error.message
    });
  }
});

export default router;