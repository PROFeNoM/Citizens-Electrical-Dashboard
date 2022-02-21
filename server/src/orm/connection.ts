import { createConnection } from 'typeorm';
import 'reflect-metadata';
import { Consumption } from './entities/Consumption';
import { Production } from './entities/Production';

export async function connectToDB(): Promise<void> {
	await createConnection({
		type: 'postgres',
		host: 'localhost',
		port: 5432,
		username: 'postgres',
		password: 'postgres',
		database: 'postgres',
		entities: [
			Consumption,
			Production,
		],
		synchronize: true,
		logging: true,
	});
}
