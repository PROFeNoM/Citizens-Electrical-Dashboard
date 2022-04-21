import { EntityManager, getConnection } from 'typeorm';
import { ConsumerProfile, Consumption } from '../db/entities/Consumption';
import { logger } from '../logger';
import { ProducerProfile, Production } from '../db/entities/Production';
import { connectToDB } from '../db/connection';
import { mockSrcDataDir, readCsv } from './utils';

main().catch(console.error);

async function main() {
	await connectToDB();
	await getConnection().transaction(async tx => {
		await loadConsumptionData(tx);
		await loadProductionData(tx);
	});
}

async function loadConsumptionData(tx: EntityManager) {
	for (let i = 1; i <= 2; ++i) {
		for await (const line of readCsv(mockSrcDataDir + `/consumption-part${i}.csv`)) {
			const consumption = new Consumption();
			consumption.drainedEnergy = parseInt(line['Total énergie soutirée (Wh)'], 10);

			if (!consumption.drainedEnergy) {
				continue;
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
				continue;
			}

			await tx.save(consumption);
		}
	}
}

async function loadProductionData(tx: EntityManager) {
	for await (const line of readCsv(mockSrcDataDir + '/production.csv')) {
		const production = new Production();
		production.injectedEnergy = parseInt(line['Total énergie injectée (Wh)'], 10);

		if (!production.injectedEnergy) {
			continue;
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
			continue;
		}

		await tx.save(production);
	}
}
