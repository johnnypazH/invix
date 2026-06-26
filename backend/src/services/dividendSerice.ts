import { supabase } from '../config/supabaseClient';
import { DividendRecord } from '../@types/dividend';

export async function processAndUploadDividends(dividends: DividendRecord[]) {
    try {
        // Validação básica antes de enviar para o banco
        if (!dividends || dividends.length === 0) {
            throw new Error('Nenhum dividendo fornecido para processamento.');
        }

        console.log(`Iniciando o upload de ${dividends.length} registros...`);

        // Inserção em lote (batch insert) no Supabase
        const { data, error } = await supabase
            .from('dividends')
            .insert(dividends)
            .select(); // O .select() retorna os dados que acabaram de ser inseridos

        if (error) {
            console.error('Erro retornado pelo Supabase:', error.message);
            throw new Error(error.message);
        }

        console.log('Upload concluído com sucesso!');
        return data;

    } catch (err) {
        console.error('Falha no processamento dos dividendos:', err);
        throw err;
    }
}
