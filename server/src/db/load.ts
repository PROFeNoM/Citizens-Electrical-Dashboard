import { rm } from 'fs/promises';
import * as download from 'download';
import { logger } from '../logger';
import { connectToDB } from './connection';
import { parseFile } from '@fast-csv/parse';
import { ConsumerProfile, Consumption } from './entities/Consumption';
import { EntityManager, getConnection } from 'typeorm';
import { ProducerProfile, Production } from './entities/Production';

const dataDir = 'raw-data';

// 2021-01-01, from 00:00:00 to 23:59:59, at UTC+1, converted to UTC
const timestampStart = '2021-06-01T00:00:00Z';
const timestampEnd = '2021-12-31T23:30:00Z';

main().catch(console.error);

async function main() {
	await downloadRawData();
	await connectToDB();
	await getConnection().transaction(async tx => {
		await loadConsumptionData(tx);
		await loadProductionData(tx);
	});
	logger.info('data loaded to database');
}

async function downloadRawData() {
	await rm(dataDir, { recursive: true, force: true });

	logger.info('downloading raw data (file 1/3)');
	await downloadDataset('conso-inf36-region', 'consumption-part1');

	logger.info('downloading raw data (file 2/3)');
	await downloadDataset('conso-sup36-region', 'consumption-part2');

	logger.info('downloading raw data (file 3/3)');
	await downloadDataset('prod-region', 'production');

	async function downloadDataset(datasetName: string, destName: string) {
		await download(
			`https://data.enedis.fr/explore/dataset/${datasetName}/download/?format=csv&refine.region=Nouvelle+Aquitaine&q=horodate:%5B${timestampStart}+TO+${timestampEnd}%5D&timezone=UTC&lang=fr&use_labels_for_header=true&csv_separator=%3B`,
			dataDir,
			{
				filename: `${destName}.csv`,
			},
		);
	}
}

export function createConsumptionRecord(line: any) {
	const consumption = new Consumption();
	consumption.drainedEnergy = parseInt(line['Total énergie soutirée (Wh)'], 10);

	if (!consumption.drainedEnergy) {
		return null;
	}

	consumption.timestamp = new Date(line['Horodate']);
	consumption.drainPoints = parseInt(line['Nb points soutirage'], 10);
	consumption.meanCurve = parseFloat(line['Courbe Moyenne n°1 + n°2 (Wh)']);

	const profile = line['Profil'];

	if (profile === 'PRO5') {
		consumption.profile = ConsumerProfile.PUBLIC_LIGHTING;
	} else if (profile.startsWith('PRO')) {
		consumption.profile = ConsumerProfile.PROFESSIONAL;
	} else if (profile.startsWith('RES')) {
		consumption.profile = ConsumerProfile.RESIDENTIAL;
	} else if (profile.startsWith('ENT')) {
		consumption.profile = ConsumerProfile.TERTIARY;
	} else {
		logger.error('failed to map consumer profile: ' + line['Profil']);
		return null;
	}

	consumption.isPrediction = consumption.timestamp > new Date();

	return consumption;
}

async function loadConsumptionData(tx: EntityManager) {
	for (let i = 1; i <= 2; ++i) {
		for await (const line of readCsv(`consumption-part${i}`)) {
			const consumption = createConsumptionRecord(line);
			if (consumption)
				await tx.save(consumption);
		}
	}
}

export function createProductionRecord(line: any) {
	const production = new Production();
	production.injectedEnergy = parseInt(line['Total énergie injectée (Wh)'], 10);

	if (!production.injectedEnergy) {
		return null;
	}

	production.injectionPoints = parseInt(line['Nb points injection'], 10);
	production.timestamp = new Date(line['Horodate']);
	production.meanCurve = parseFloat(line['Courbe Moyenne n°1 + n°2 (Wh)']);

	const profile = line['Filière de production'];

	if (profile.endsWith('Bioénergies')) {
		production.profile = ProducerProfile.BIOENERGY;
	} else if (profile.endsWith('Eolien')) {
		production.profile = ProducerProfile.EOLIAN;
	} else if (profile.endsWith('Hydraulique')) {
		production.profile = ProducerProfile.HYDRAULIC;
	} else if (profile.endsWith('Thermique non renouvelable')) {
		production.profile = ProducerProfile.NON_RENEWABLE_THERMAL;
	} else if (profile.endsWith('Autres')) {
		production.profile = ProducerProfile.OTHER;
	} else if (profile.endsWith('Solaire')) {
		production.profile = ProducerProfile.SOLAR;
	} else if (profile.endsWith('Total toutes filières')) {
		production.profile = ProducerProfile.TOTAL;
	} else {
		logger.error('failed to map producer profile: ' + line['Profil']);
		return null;
	}

	production.isPrediction = production.timestamp > new Date();

	return production;
}

async function loadProductionData(tx: EntityManager) {
	for await (const line of readCsv('production')) {
		const production = createProductionRecord(line);
		if (production)
			await tx.save(production);
	}
}

export function readCsv(filename: string) {
	logger.info(`parsing ${filename}.csv`);

	return parseFile(`${dataDir}/${filename}.csv`, {
		headers: true,
		delimiter: ';',
	});
}
