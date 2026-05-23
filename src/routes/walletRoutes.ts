import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { AuthRequest } from '../middlewares/authMiddleware';
import axios from 'axios';
import { supabase } from '../config/supabaseClient';

const router = Router();

// POST /api/wallets - Criar uma carteira vinculada a um usuário
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao } = req.body; // O Front manda em português (nome, descricao)
    const userId = req.userId; // Pega direto do Token!

    const userRepository = AppDataSource.getRepository(User);
    const walletRepository = AppDataSource.getRepository(Wallet);

    // Busca o usuário no banco para vincular à carteira
    const user = await userRepository.findOneBy({ id: userId as string });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const wallet = new Wallet();
    wallet.name = nome;
    wallet.description = descricao;
    wallet.assets = []; // Começa sempre vazia
    wallet.user = user; // O TypeORM faz a mágica de criar a Foreign Key aqui

    await walletRepository.save(wallet);

    // Resposta no exato contrato que o Front-end pediu!
    res.status(201).json({
      id: wallet.id,
      nome: wallet.name,
      descricao: wallet.description || '',
      assets: wallet.assets,
      user_id: user.id
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar carteira', details: error.message });
  }
});

// GET /api/wallets/user/:userId - Busca as carteiras de um usuário
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const walletRepository = AppDataSource.getRepository(Wallet);

    // O TypeORM permite fazer a busca diretamente pela relação.
    // Esta query busca todas as 'wallets' onde o 'user.id' é igual ao 'userId' do parâmetro.
    const wallets = await walletRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });

    // Retorna as carteiras encontradas (pode ser um array vazio, o que é o comportamento esperado)
    res.json(wallets);
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar carteiras', details: error.message });
  }
});

// GET /api/wallets/:id - Busca uma carteira específica pelo ID (para a tela de Detalhes da Carteira)
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const walletRepository = AppDataSource.getRepository(Wallet);
    
    // Busca a carteira garantindo que pertence ao usuário logado (Segurança!)
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada.' });
    }

    // DICA DO FRONTEND: Segurança para garantir que os assets são sempre um Array (JSON parse)
    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    let enrichedAssets: any[] = [];

    if (ativos.length > 0) {
      // Extrai os tickers para fazer uma única chamada na Brapi
      const tickers = ativos.map((a: any) => a.ticker).join(',');
      const brapiToken = process.env.BRAPI_TOKEN;

      try {
        const response = await axios.get(`https://brapi.dev/api/quote/${tickers}?token=${brapiToken}`);
        const brapiResults = response.data.results || [];

        // Cria um mapa/dicionário para busca super rápida
        const brapiMap = new Map();
        brapiResults.forEach((item: any) => brapiMap.set(item.symbol, item));

        enrichedAssets = ativos.map((ativo: any) => {
          const brapiData = brapiMap.get(ativo.ticker) || {};
          return {
            ticker: ativo.ticker,
            nome: brapiData.shortName || ativo.ticker,
            setor: 'Ações', // Fixado por enquanto, pode ser dinâmico futuramente
            quantidade: ativo.quantity || 0,
            precoMedio: ativo.precoMedio || 0, // Mantém do banco, ou 0 se não existir
            precoAtual: brapiData.regularMarketPrice || 0
          };
        });
      } catch (apiError) {
        console.error('Erro ao buscar cotações na Brapi:', apiError);
        // Fallback: se a Brapi falhar, envia os ativos com preço 0 para não quebrar a tela
        enrichedAssets = ativos.map((ativo: any) => ({
          ticker: ativo.ticker,
          nome: ativo.ticker,
          setor: 'Ações',
          quantidade: ativo.quantity || 0,
          precoMedio: ativo.precoMedio || 0,
          precoAtual: 0
        }));
      }
    }

    // Monta a resposta EXATAMENTE no contrato que o Angular pediu
    res.json({
      id: wallet.id,
      nome: wallet.name,
      descricao: wallet.description || '',
      assets: enrichedAssets
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar detalhes da carteira', details: error.message });
  }
});

// POST /api/wallets/:id/assets - Adiciona um novo ativo (aporte) em uma carteira existente
router.post('/:id/assets', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const novoAtivo = req.body; // Ex: { ticker: 'WEGE3', quantidade: 50, precoMedio: 38.50 }

    if (!novoAtivo.ticker) {
      return res.status(400).json({ error: 'O ticker do ativo é obrigatório.' });
    }

    // 1. Padroniza o Ticker para MAIÚSCULO
    const tickerFormatado = novoAtivo.ticker.toUpperCase();

    // 2. Verifica se o ativo é válido (No nosso banco ou na Brapi)
    let ativoValido = false;
    
    // Tenta achar na nossa própria base (é muito mais rápido!)
    const { data: dbData } = await supabase.from('dividends').select('ticker').eq('ticker', tickerFormatado).limit(1);
    
    if (dbData && dbData.length > 0) {
      ativoValido = true;
    } else {
      // Se não achou no banco, faz a prova de fogo na Brapi
      try {
        const brapiToken = process.env.BRAPI_TOKEN;
        const response = await axios.get(`https://brapi.dev/api/quote/${tickerFormatado}?token=${brapiToken}`);
        if (response.data.results && response.data.results.length > 0) {
          ativoValido = true;
        }
      } catch (e) {} // Se a Brapi falhar ou não achar, o ativoValido continua false
    }

    if (!ativoValido) {
      return res.status(400).json({ error: `O ativo '${tickerFormatado}' não existe. Verifique o código e tente novamente.` });
    }

    const walletRepository = AppDataSource.getRepository(Wallet);
    
    // Busca a carteira validando se ela existe E se pertence ao usuário logado!
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada ou não pertence a este usuário.' });
    }

    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    const quantityToAdd = novoAtivo.quantidade || novoAtivo.quantity || 0;
    const precoMedioToAdd = novoAtivo.precoMedio || 0;

    // Verifica se o ativo já existe na carteira para somar em vez de duplicar
    const existingAssetIndex = ativos.findIndex((a: any) => a.ticker === tickerFormatado);

    if (existingAssetIndex >= 0) {
      // Ativo já existe na carteira, vamos somar a quantidade e recalcular o preço médio
      const asset = ativos[existingAssetIndex];
      const currentQty = asset.quantity || 0;
      const currentPrecoMedio = asset.precoMedio || 0;
      
      const novaQuantidadeTotal = currentQty + quantityToAdd;
      let novoPrecoMedio = 0;
      
      // Cálculo do novo preço médio ponderado
      if (novaQuantidadeTotal > 0) {
        novoPrecoMedio = ((currentQty * currentPrecoMedio) + (quantityToAdd * precoMedioToAdd)) / novaQuantidadeTotal;
      }
      
      ativos[existingAssetIndex].quantity = novaQuantidadeTotal;
      ativos[existingAssetIndex].precoMedio = Number(novoPrecoMedio.toFixed(2));
    } else {
      // Ativo novo, apenas adiciona na lista
      ativos.push({
        ticker: tickerFormatado,
        quantity: quantityToAdd,
        precoMedio: precoMedioToAdd
      });
    }

    wallet.assets = ativos; // Atualiza a carteira

    await walletRepository.save(wallet); // O TypeORM salva a carteira atualizada no banco!

    // Retorna EXATAMENTE o contrato que o Angular pediu
    res.status(201).json({ 
      message: 'Ativo adicionado com sucesso!', 
      asset: {
        ticker: tickerFormatado,
        quantidade: existingAssetIndex >= 0 ? ativos[existingAssetIndex].quantity : quantityToAdd,
        precoMedio: existingAssetIndex >= 0 ? ativos[existingAssetIndex].precoMedio : precoMedioToAdd
      } 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao adicionar ativo', details: error.message });
  }
});

// DELETE /api/wallets/:id/assets/:ticker - Remove um ativo de uma carteira existente
router.delete('/:id/assets/:ticker', async (req: AuthRequest, res: Response) => {
  try {
    const { id, ticker } = req.params;
    const userId = req.userId;

    if (!ticker) {
      return res.status(400).json({ error: 'O ticker do ativo é obrigatório.' });
    }

    const tickerFormatado = ticker.toUpperCase();
    const walletRepository = AppDataSource.getRepository(Wallet);
    
    // Busca a carteira validando se ela existe E se pertence ao usuário logado!
    const wallet = await walletRepository.findOne({
      where: { id, user: { id: userId as string } }
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Carteira não encontrada ou não pertence a este usuário.' });
    }

    let ativos = wallet.assets || [];
    if (typeof ativos === 'string') {
      try { ativos = JSON.parse(ativos); } catch (e) {}
    }

    // Filtra a lista, mantendo apenas os ativos que são diferentes do que queremos deletar
    const ativosFiltrados = ativos.filter((a: any) => a.ticker !== tickerFormatado);

    wallet.assets = ativosFiltrados; // Atualiza a carteira com a lista filtrada
    await walletRepository.save(wallet); // Salva no banco!

    res.status(200).json({ message: `Ativo ${tickerFormatado} removido com sucesso!`, assets: wallet.assets });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao remover ativo', details: error.message });
  }
});

export default router;