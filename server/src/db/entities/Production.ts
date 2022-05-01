import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Zone } from './Zone';
import { DataTable } from './DataTable';

export enum ProducerProfile {
	BIOENERGY = 'BIOENERGY',
	EOLIAN = 'EOLIAN',
	HYDRAULIC = 'HYDRAULIC',
	NON_RENEWABLE_THERMAL = 'NON_RENEWABLE_THERMAL',
	OTHER = 'OTHER',
	SOLAR = 'SOLAR',
	TOTAL = 'TOTAL',
}

@Entity('production')
export class Production implements DataTable<ProducerProfile> {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	@Index()
	public timestamp: Date;

	@ManyToOne(() => Zone, { nullable: false })
	public zone: Zone;

	@Column({ type: 'enum', enum: ProducerProfile })
	public profile: ProducerProfile;

	@Column({ type: 'float', nullable: false })
	public energy: number;

	@Column({ type: 'boolean', nullable: false })
	public prediction: boolean;
}
