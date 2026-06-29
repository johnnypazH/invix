import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

// Interface para garantir a tipagem do JSON de ativos
// Isso ajuda na consistência e autocompletar no código
export interface Asset {
    ticker: string;
    quantity: number;
    precoMedio?: number;
    dataCompra?: string; // Data em que o ativo foi adquirido (formato YYYY-MM-DD)
    setor?: string;      // Setor salvo no banco (Ex: Energia)
    nome?: string;       // Nome da empresa salvo no banco
    compras?: Array<{ data: string; quantidade: number; preco: number }>;
}

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string; // Ex: "Carteira de Aposentadoria"

    @Column({ nullable: true })
    description?: string; // Ex: "Focada em dividendos mensais"

    @Column({ type: "float", nullable: true })
    metaMensal?: number; // Meta mensal associada à carteira

    // Guarda a lista de ações (o mesmo formato do array que você enviou no POST)
    @Column("jsonb", { default: [] })
    assets!: Asset[]; 

    // Várias carteiras pertencem a um único usuário (ManyToOne)
    @ManyToOne(() => User, user => user.wallets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user!: User;
}