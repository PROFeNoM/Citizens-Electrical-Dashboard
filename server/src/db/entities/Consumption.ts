import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Zone } from './Zone';
import { DataTable } from './DataTable';

export enum ConsumerProfile {
	PUBLIC_LIGHTING = 'PUBLIC_LIGHTING',
	PROFESSIONAL = 'PROFESSIONAL',
	RESIDENTIAL = 'RESIDENTIAL',
	TERTIARY = 'TERTIARY',
}

@Entity('consumption')
export class Consumption implements DataTable<ConsumerProfile> {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	@Index()
	public timestamp: Date;

	@ManyToOne(() => Zone, { nullable: false })
	public zone: Zone;

	@Column({ type: 'enum', enum: ConsumerProfile, nullable: false })
	public profile: ConsumerProfile;

	@Column({ type: 'float', nullable: false })
	public energy: number;

	@Column({ type: 'boolean', nullable: false })
	public prediction: boolean;
}
