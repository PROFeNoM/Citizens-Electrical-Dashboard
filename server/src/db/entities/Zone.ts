import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zone')
export class Zone {
	@PrimaryGeneratedColumn({ type: 'int' })
	public id: number;

	@Column({ type: 'varchar', length: 100, nullable: false })
	public name: string;
}
