import { createConnection } from 'typeorm';
import 'reflect-metadata';
import { Consumption } from './entities/Consumption';
import { Production } from './entities/Production';
import { logger } from '../logger';

export async function connectToDB(synchronize: boolean): Promise<void> {
	if (synchronize) {
		logger.info('initializing database');
	}

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
		synchronize: synchronize,
		logging: false,
	});
}
