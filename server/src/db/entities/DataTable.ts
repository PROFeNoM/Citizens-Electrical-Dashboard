import { Zone } from './Zone';

export interface DataTable<P> {
	id: number;
	timestamp: Date;
	zone: Zone;
	profile: P;
	energy: number;
	prediction: boolean;
}
