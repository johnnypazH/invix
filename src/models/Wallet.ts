import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

// Interface para garantir a tipagem do JSON de ativos
// Isso ajuda na consistência e autocompletar no código
export interface Asset {
    ticker: string;
    quantity: number;
    precoMedio?: number;
}

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string; // Ex: "Carteira de Aposentadoria"

    @Column({ nullable: true })
    description?: string; // Ex: "Focada em dividendos mensais"

    // Guarda a lista de ações (o mesmo formato do array que você enviou no POST)
    @Column("jsonb", { default: [] })
    assets!: Asset[]; 

    // Várias carteiras pertencem a um único usuário (ManyToOne)
    @ManyToOne(() => User, user => user.wallets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user!: User;
}