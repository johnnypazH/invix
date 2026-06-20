import axios from 'axios';
import { supabase } from '@/config/supabaseClient';

// Interface para tipar a resposta da Brapi
interface BrapiCashDividend {
  rate: number;
  label: string;
  paymentDate: string | null;
  approvedOn: string | null;
  lastDatePrior: string | null;
}

interface BrapiStockDividend {
  label: string;
  factor: number;
  lastDatePrior: string | null;
}

const BRAPI_TOKEN = process.env.BRAPI_TOKEN;

export async function fetchAndSaveDividends(ticker: string) {
  try {
    if (!BRAPI_TOKEN) {
      console.error('Erro de configuração: A variável de ambiente BRAPI_TOKEN não foi encontrada.');
      throw new Error('O token da API Brapi não está configurado no arquivo .env');
    }

    console.log(`Buscando informações da empresa ${ticker} na Brapi...`);
    
    // Rota 'list' é a mais confiável para buscar Nome real e Setor na Brapi!
    const listUrl = `https://brapi.dev/api/quote/list?search=${ticker}&token=${BRAPI_TOKEN}`;
    const listResponse = await axios.get(listUrl);
    
    let nomeEmpresa = ticker;
    let setorEmpresa = 'Outros';

    if (listResponse.data.stocks && listResponse.data.stocks.length > 0) {
      // Procura a ação exata caso a busca traga mais de uma (ex: PETR4 e PETR4F)
      const stockInfo = listResponse.data.stocks.find((s: any) => s.stock === ticker) || listResponse.data.stocks[0];
      nomeEmpresa = stockInfo.name || stockInfo.stock || ticker;
      setorEmpresa = stockInfo.sector || 'Outros';
    }

    console.log(`Buscando dividendos e eventos de ${ticker}...`);
    
    const quoteUrl = `https://brapi.dev/api/quote/${ticker}?dividends=true&token=${BRAPI_TOKEN}`;
    const quoteResponse = await axios.get(quoteUrl);
    
    const data = quoteResponse.data;
    
    if (!data.results || data.results.length === 0) {
      console.log(`Nenhum dado encontrado para o ticker ${ticker} na Brapi.`);
      return;
    }

    const quoteData = data.results[0];
    const dividendsData = quoteData.dividendsData;

    if (!dividendsData) {
      console.log('Nenhum dado de proventos encontrado na resposta.');
      return;
    }

    const cashDividends = dividendsData.cashDividends || [];
    const stockDividends = dividendsData.stockDividends || [];

    // =========================================================================
    // 1. Processar e salvar Dividendos em Dinheiro (cashDividends)
    // =========================================================================
    if (cashDividends.length > 0) {
      console.log(`Encontrados ${cashDividends.length} registros de dividendos em dinheiro. Preparando para o Supabase...`);

      // Mantemos os nomes das colunas existentes no banco (amount, payment_date, etc.) 
      // para não quebrar suas rotas atuais. Quando enviar para o front (Angular), 
      // você pode mapear os atributos para português lá no controller se quiser.
      const formattedDividends = cashDividends.map((d: BrapiCashDividend) => ({
        ticker: ticker,
        name: nomeEmpresa,
        sector: setorEmpresa,
        amount: d.rate,
        type: d.label,
        payment_date: d.paymentDate ? d.paymentDate.split('T')[0] : null,
        approved_on: d.approvedOn ? d.approvedOn.split('T')[0] : null,
        last_date_prior: d.lastDatePrior ? d.lastDatePrior.split('T')[0] : null
      }));

      const { data: existingData, error: fetchError } = await supabase
        .from('dividends')
        .select('payment_date, type')
        .eq('ticker', ticker);

      if (fetchError) throw fetchError;

      const existingSet = new Set(existingData.map((d: { payment_date: string | null; type: string }) => `${d.payment_date}-${d.type}`));
      const newDividends = formattedDividends.filter((d: typeof formattedDividends[0]) => !existingSet.has(`${d.payment_date}-${d.type}`));

      if (newDividends.length > 0) {
        console.log(`Inserindo ${newDividends.length} novos dividendos para ${ticker}...`);
        const { error } = await supabase.from('dividends').insert(newDividends);
        if (error) throw error;
        console.log(`Sucesso! Dividendos salvos no banco de dados.`);
      } else {
        console.log(`Todos os dividendos em dinheiro de ${ticker} já estão no banco.`);
      }
    }

    // =========================================================================
    // 2. Processar e salvar Eventos Corporativos (stockDividends)
    // =========================================================================
    if (stockDividends.length > 0) {
      console.log(`Encontrados ${stockDividends.length} registros de eventos corporativos. Preparando para o Supabase...`);

      const formattedEvents = stockDividends.map((d: BrapiStockDividend) => ({
        ticker: ticker,
        name: nomeEmpresa,
        sector: setorEmpresa,
        type: d.label, // DESDOBRAMENTO, GRUPAMENTO, BONIFICACAO
        factor: d.factor,
        last_date_prior: d.lastDatePrior ? d.lastDatePrior.split('T')[0] : null
      }));

      // Tenta buscar eventos existentes para evitar duplicidade.
      // Lembre-se de criar a tabela 'corporate_events' no Supabase!
      const { data: existingEvents, error: fetchEventsError } = await supabase
        .from('corporate_events')
        .select('last_date_prior, type')
        .eq('ticker', ticker);

      if (fetchEventsError) {
         console.warn(`Aviso: Falha ao buscar tabela 'corporate_events' (ela já foi criada?). Detalhes: ${fetchEventsError.message}`);
      } else {
        const existingEventsSet = new Set(existingEvents?.map((d: { last_date_prior: string | null; type: string }) => `${d.last_date_prior}-${d.type}`) || []);
        const newEvents = formattedEvents.filter((d: typeof formattedEvents[0]) => !existingEventsSet.has(`${d.last_date_prior}-${d.type}`));

        if (newEvents.length > 0) {
          console.log(`Inserindo ${newEvents.length} novos eventos corporativos para ${ticker}...`);
          const { error: insertEventError } = await supabase.from('corporate_events').insert(newEvents);
          if (insertEventError) throw insertEventError;
          console.log(`Sucesso! Eventos corporativos salvos no banco de dados.`);
        } else {
          console.log(`Todos os eventos corporativos de ${ticker} já estão no banco.`);
        }
      }
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro de rede ou da API Brapi ao buscar dividendos:', error.response?.data || error.message);
    } else if (error instanceof Error) {
      console.error('Erro geral ao processar dividendos e eventos:', error.message);
    }
  }
}