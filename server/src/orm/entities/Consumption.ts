import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('consumption')
export class Consumption {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	public timestamp: Date;

	@Column({ name: 'drain_points', type: 'int', nullable: false })
	public drainPoints: number;

	@Column({ name: 'drained_energy', type: 'int', nullable: false })
	public drainedEnergy: number;

	@Column({ name: 'mean_curve', type: 'float', nullable: false })
	public meanCurve: number;
}
