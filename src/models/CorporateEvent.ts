import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('corporate_events')
export class CorporateEvent {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    ticker!: string; // Ex: ITSA4

    @Column()
    type!: string; // Ex: DESDOBRAMENTO, BONIFICACAO

    @Column("float")
    factor!: number; // Ex: 1.05

    @Column({ type: "date", nullable: true })
    last_date_prior!: string | null;
}