import { EntityManager, getConnection } from 'typeorm';
import { ConsumerProfile, Consumption } from '../db/entities/Consumption';
import { ProducerProfile, Production } from '../db/entities/Production';
import { connectToDB } from '../db/connection';
import { mockDataDir, readCsv } from './utils';
import { Zone } from '../db/entities/Zone';

interface DataTable<P> {
	id: number;
	timestamp: Date;
	zone: Zone;
	profile: P;
	energy: number;
}

main().catch(console.error);

async function main() {
	await connectToDB();
	await getConnection().transaction(async tx => {
		await loadCsvToTable(tx, mockDataDir + '/consumption.csv', Consumption, parseConsumerProfile);
		await loadCsvToTable(tx, mockDataDir + '/production.csv', Production, parseProducerProfile);
	});
}

function parseConsumerProfile(raw: string): ConsumerProfile {
	if (raw === 'PRO5') {
		return  ConsumerProfile.PUBLIC_LIGHTING;
	} else if (raw.startsWith('PRO')) {
		return  ConsumerProfile.PROFESSIONAL;
	} else if (raw.startsWith('RES')) {
		return  ConsumerProfile.RESIDENTIAL;
	} else if (raw.startsWith('ENT')) {
		return  ConsumerProfile.TERTIARY;
	} else {
		throw new Error('failed to map consumer profile: ' + raw);
	}
}

function parseProducerProfile(raw: string): ProducerProfile {
	if (raw.endsWith('Bioénergies')) {
		return ProducerProfile.BIOENERGY;
	} else if (raw.endsWith('Eolien')) {
		return ProducerProfile.EOLIAN;
	} else if (raw.endsWith('Hydraulique')) {
		return ProducerProfile.HYDRAULIC;
	} else if (raw.endsWith('Thermique non renouvelable')) {
		return ProducerProfile.NON_RENEWABLE_THERMAL;
	} else if (raw.endsWith('Autres')) {
		return ProducerProfile.OTHER;
	} else if (raw.endsWith('Solaire')) {
		return ProducerProfile.SOLAR;
	} else if (raw.endsWith('Total toutes filières')) {
		return ProducerProfile.TOTAL;
	} else {
		throw new Error('failed to map producer profile: ' + raw);
	}
}

async function loadCsvToTable<P>(tx: EntityManager, path: string, tableType: new () => DataTable<P>, profileParser: (raw: string) => P) {
	let jobs: Promise<void>[] = [];

	for await (const line of readCsv(path)) {
		jobs.push(new Promise((resolve, reject) => {
			const entry = new tableType();
			entry.timestamp = new Date(line.timestamp);
			entry.energy = parseInt(line.energy, 10);
			entry.profile = profileParser(line.profile);

			tx.save(entry)
				.catch(reject)
				.then(() => resolve());
		}));
		// make sure to not run out of memory
		if (jobs.length === 1000) {
			await Promise.all(jobs);
			jobs = [];
		}
	}

	await Promise.all(jobs);
}
