import { getConnection } from 'typeorm';
import { Consumption } from '../db/entities/Consumption';
import { Production } from '../db/entities/Production';
import { connectToDB } from '../db/connection';
import { mockDataDir } from './utils';
import { getZones, loadCsvToTable, parseConsumerProfile, parseProducerProfile } from './utils';

main().catch(console.error);

async function main() {
	await connectToDB();
	await getConnection().transaction(async tx => {
		const zones = await getZones(tx);
		await loadCsvToTable(tx, mockDataDir + '/consumption.csv', Consumption, parseConsumerProfile, zones);
		await loadCsvToTable(tx, mockDataDir + '/production.csv', Production, parseProducerProfile, zones);
	});
}
