import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("WaterData")
class WaterData {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    image!: string;

    @Column()
    location!: string;

    @Column()
    depth!: number;

    @Column()
    date!: Date;

    @Column({ nullable: true })
    flagged!: boolean;

    @Column({ nullable: true })
    remarks!: string;
}

export default WaterData;
