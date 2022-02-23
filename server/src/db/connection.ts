import { createConnection } from 'typeorm';
import 'reflect-metadata';
import { Consumption } from './entities/Consumption';
import { Production } from './entities/Production';
import { config } from '../config';

export async function connectToDB(): Promise<void> {
	await createConnection({
		...config.database,
		type: 'postgres',
		entities: [
			Consumption,
			Production,
		],
		synchronize: true,
		logging: false,
	});
}
