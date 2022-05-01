import { connectToDB } from "./connection";
import { logger } from "../logger";
import { getConnection } from "typeorm";
import { parseFile } from "@fast-csv/parse";
import {ProducerProfile, Production} from "./entities/Production";
import {ConsumerProfile, Consumption} from "./entities/Consumption";

function createProductionRecord(line: any) {
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

	production.isPrediction = true;

	return production;
}


function createConsumptionRecord(line: any) {
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

	consumption.isPrediction = true;

	return consumption;
}


function readCsv(filepath: string) {
	logger.info(`parsing ${filepath}`);

	return parseFile(`${filepath}`, {
		headers: true,
		delimiter: ',',
	});
}

// Parse the arguments passed to the script
// Usage: node load_predictions.js <file_path> <production|consumption>
const [, , filePath, type] = process.argv;

main(filePath, type).catch(console.error);

async function main(filePath: string, type: string) {
	logger.info(`loading ${type} predictions from ${filePath}`);
	const data = readCsv(filePath);
	await connectToDB();
	logger.info(`connected to the database`);
	await getConnection().transaction(async tx => {
		for await (const line of data) {
			const record = type === "production" ?
				createProductionRecord(line) :
				createConsumptionRecord(line);
			await tx.save(record);
		}
	});
	logger.info('data loaded to database');
}