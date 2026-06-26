export interface DividendRecord {
    ticker: string;          // Ex: PETR4, VALE3
    name?: string;           // Nome da empresa salvo no banco
    sector?: string;         // Setor salvo no banco
    amount: number;          // Valor do dividendo
    type: 'Rendimento' | 'JCP' | 'Amortização' | string; 
    payment_date: string | null;    // Formato ISO (YYYY-MM-DD), pode ser nulo
    approved_on?: string | null;   // Data de aprovação, opcional
    last_date_prior?: string | null; // Data "com", opcional
}

export interface CorporateEventRecord {
    ticker: string;          // Ex: ITSA4
    name?: string;           // Nome da empresa
    sector?: string;         // Setor da empresa
    type: 'DESDOBRAMENTO' | 'GRUPAMENTO' | 'BONIFICACAO' | string; // label do evento
    factor: number;          // Multiplicador (ex: 1.05)
    last_date_prior: string | null; // Data ex
}
