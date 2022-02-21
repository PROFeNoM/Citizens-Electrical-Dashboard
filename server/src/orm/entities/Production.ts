import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('production')
export class Production {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'timestamp with time zone', nullable: false })
	public timestamp: Date;

	@Column({ name: 'injection_points', type: 'int', nullable: false })
	public injectionPoints: number;

	@Column({ name: 'injected_energy', type: 'int', nullable: false })
	public injectedEnergy: number;
}
