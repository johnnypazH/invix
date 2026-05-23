import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('As credenciais do Supabase não foram encontradas no arquivo .env');
}

// Inicializa e exporta o cliente com configurações específicas para o Backend (Node.js)
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false // Muito importante no backend para evitar warnings de 'localStorage'
    },
    realtime: {
        transport: ws as any // Resolve o erro de falta de suporte a WebSockets no Node.js 20 (as any resolve a tipagem estrita)
    }
});
