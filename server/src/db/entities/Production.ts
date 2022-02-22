import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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
export class Production {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	@Index()
	public timestamp: Date;

	@Column({ type: 'enum', enum: ProducerProfile })
	public profile: ProducerProfile;

	@Column({ name: 'injection_points', type: 'float', nullable: false })
	public injectionPoints: number;

	@Column({ name: 'injected_energy', type: 'float', nullable: false })
	public injectedEnergy: number;

	@Column({ name: 'mean_curve', type: 'float', nullable: false })
	public meanCurve: number;
}
