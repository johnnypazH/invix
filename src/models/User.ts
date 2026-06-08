import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Wallet } from "./Wallet";

@Entity('users') // Nome da tabela que será criada no banco
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ type: "float", default: 5000 })
    objetivoMensal!: number; // Meta de independência financeira (ex: 5000)

    // Um usuário pode ter várias carteiras (OneToMany)
    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets!: Wallet[];
}