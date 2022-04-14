import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum ConsumerProfile {
	PUBLIC_LIGHTING = 'PUBLIC_LIGHTING',
	PROFESSIONAL = 'PROFESSIONAL',
	RESIDENTIAL = 'RESIDENTIAL',
	TERTIARY = 'TERTIARY',
}

@Entity('consumption')
export class Consumption {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	@Index()
	public timestamp: Date;

	@Column({ type: 'enum', enum: ConsumerProfile, nullable: false })
	public profile: ConsumerProfile;

	@Column({ name: 'drain_points', type: 'float', nullable: false })
	public drainPoints: number;

	@Column({ name: 'drained_energy', type: 'float', nullable: false })
	public drainedEnergy: number;

	@Column({ name: 'mean_curve', type: 'float', nullable: false })
	public meanCurve: number;
}
