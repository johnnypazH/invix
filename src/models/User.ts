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

    // Um usuário pode ter várias carteiras (OneToMany)
    @OneToMany(() => Wallet, wallet => wallet.user)
    wallets!: Wallet[];
}