import * as turf from '@turf/turf';
import * as download from 'download';
import { logger } from '../logger';
import { parseFile, parseString, writeToPath } from 'fast-csv';
import * as FormData from 'form-data';
import axios from 'axios';
import { EOL } from 'os';
import { exists, mockSrcDataDir, readCsv } from './utils';
import { ConsumerProfile } from '../db/entities/Consumption';
import { ProducerProfile } from '../db/entities/Production';
import * as zones from '../geodata/zones.json'
import { FeatureCollection, MultiPolygon } from '@turf/turf';
import { mkdir } from 'fs/promises';

type Coefficients = Record<string, Record<ConsumerProfile | ProducerProfile, number>>;

const timestampStart = '2021-06-01T00:00:00Z';
const timestampEnd = '2021-12-31T23:30:00Z';

main().catch(console.error);

async function main() {
	await mkdir(mockSrcDataDir, { recursive: true });
	await downloadConsAndProdData();
	const addresses = await downloadRandomAddresses();
	const coefficients = getCoefficients();
	await generateMock(addresses, coefficients);
}

async function downloadConsAndProdData() {
	logger.info(`downloading consumption data (part 1/2)`);
	await downloadDataset('conso-inf36-region', 'consumption-part1');

	logger.info(`downloading consumption data (part 2/2)`);
	await downloadDataset('conso-sup36-region', 'consumption-part2');

	logger.info(`downloading production data`);
	await downloadDataset('prod-region', 'production');

	async function downloadDataset(datasetName: string, destName: string) {
		if (await exists(`${mockSrcDataDir}/${destName}.csv`)) {
			logger.info('-> file already exists, skipping')
			return
		}

		await download(
			`https://data.enedis.fr/explore/dataset/${datasetName}/download/?format=csv&refine.region=Nouvelle+Aquitaine&q=horodate:%5B${timestampStart}+TO+${timestampEnd}%5D&timezone=UTC&lang=fr&use_labels_for_header=true&csv_separator=%3B`,
			mockSrcDataDir,
			{
				filename: `${destName}.csv`,
			},
		);
	}
}

async function downloadRandomAddresses(): Promise<string[][]> {
	logger.info(`downloading random addresses`);

	const filename = mockSrcDataDir + '/addresses.csv';

	// return data from cache if present
	if (await exists(filename)) {
		logger.info('-> file already exists, skipping')
		const rows: string[][] = [];
		for await (const row of parseFile(filename, { delimiter: ';', headers: true })) {
			rows.push(row);
		}
		return rows;
	}

	// generate a CSV containing a mesh of points

	const NW = [44.85167061339378, -0.5671098076715935];
	const SE = [44.83706864026471, -0.5441770324348592];

	const n = 45;
	const latStep = (SE[0] - NW[0]) / n;
	const longStep = (SE[1] - NW[1]) / n;

	let csv = 'latitude;longitude\n';
	for (let lat = NW[0]; lat > SE[0]; lat += latStep) {
		for (let long = NW[1]; long < SE[1]; long += longStep) {
			csv += `${lat};${long}\n`
		}
	}

	// transform the mesh of points to a list of addresses using the address API

	const form = new FormData();
	form.append('data', csv, { filename: 'data.csv' });
	const res = await axios.post('https://api-adresse.data.gouv.fr/reverse/csv', form, { headers: form.getHeaders() })

	const addresses = parseString((res.data as string)
		.split('\n')
		.join(EOL), { headers: true, delimiter: ';' });

	// filter out unnecessary fields and add the name of the zone where the point is

	const filtered: string[][] = [];

	for await (const a of addresses) {
		// find in which zone is the address
		let zoneName: string = null;
		const point = turf.point([a.longitude, a.latitude]);
		for (const zone of (zones as FeatureCollection<MultiPolygon>).features) {
			if (turf.booleanContains({ type: 'Polygon', coordinates: zone.geometry.coordinates[0] }, point)) {
				zoneName = zone.properties.libelle;
				break;
			}
		}
		if (zoneName === null) {
			continue;
		}

		filtered.push([zoneName, a.result_housenumber, a.result_name, a.result_citycode]);
	}

	// cache the result in a file
	writeToPath(filename, filtered, {
		delimiter: ';',
		headers: ['zone name', 'house number', 'street name', 'INSEE city code']
	});

	return filtered;
}

/**
 * Returns, for each zone and for each profile, a coefficient to apply on mock production and consumption
 * data in order to have something that seems legit.
 */
function getCoefficients(): Coefficients {
	const coefficients: Coefficients = {};

	for (const zone of (zones as FeatureCollection).features) {
		const coeff = coefficients[zone.properties.libelle] = {} as Record<string, number>;
		coeff[ConsumerProfile.PROFESSIONAL] = zone.properties.PRO1 + zone.properties.PRO2;
		coeff[ConsumerProfile.RESIDENTIAL] = zone.properties.RES1 + zone.properties.RES2;
		coeff[ConsumerProfile.TERTIARY] = zone.properties.ENT;
		coeff[ConsumerProfile.PUBLIC_LIGHTING] = Math.round(turf.area(zone) / 10_000);
		coeff[ProducerProfile.SOLAR] = zone.properties.PROD_F5;
	}

	return coefficients;
}

async function generateMock(addresses: string[][], coefficients: Coefficients) {

	for await (const line of readCsv(mockSrcDataDir + '/consumption-part1.csv')) {

	}
}
