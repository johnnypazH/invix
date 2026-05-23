import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';
import { CorporateEvent } from "../models/CorporateEvent";
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.SUPABASE_DB_URL,
    synchronize: true, // MÁGICA: Isso faz o TypeORM criar as tabelas sozinho ao iniciar o servidor!
    logging: false,
    entities: [User, Wallet, CorporateEvent],
    subscribers: [],
    migrations: [],
});