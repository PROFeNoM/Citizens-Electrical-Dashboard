import * as turf from '@turf/turf';
import * as download from 'download';
import { logger } from '../logger';
import { CsvFormatterStream, format, parseFile, parseString, writeToPath } from 'fast-csv';
import * as FormData from 'form-data';
import axios from 'axios';
import { EOL } from 'os';
import { exists, mockDataDir, mockSrcDataDir, randomElement, readCsv } from './utils';
import { ConsumerProfile } from '../db/entities/Consumption';
import { ProducerProfile } from '../db/entities/Production';
import * as zones from '../geodata/zones.json'
import { FeatureCollection, MultiPolygon } from '@turf/turf';
import { mkdir } from 'fs/promises';
import { createWriteStream, PathLike } from 'fs';

type Coefficients = Record<string, Record<ConsumerProfile | ProducerProfile, number>>;
type Addresses = Record<string, string[][]>;

const timestampStart = '2021-06-01T00:00:00Z';
const timestampEnd = '2021-12-31T23:30:00Z';

main().catch(console.error);

async function main() {
	await mkdir(mockSrcDataDir, { recursive: true });
	await mkdir(mockDataDir, { recursive: true });
	await downloadConsAndProdData();
	const addresses = await downloadRandomAddresses();
	const coefficients = getCoefficients();
	await generateMock(addresses, coefficients);
	logger.info('done!')
}

async function downloadConsAndProdData() {
	logger.info('downloading consumption data (part 1/2)');
	await downloadDataset('conso-inf36-region', 'consumption-part1');

	logger.info('downloading consumption data (part 2/2)');
	await downloadDataset('conso-sup36-region', 'consumption-part2');

	logger.info('downloading production data');
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
				filename: destName + '.csv',
			},
		);
	}
}

async function downloadRandomAddresses(): Promise<Addresses> {
	logger.info('downloading random addresses');

	const filename = mockSrcDataDir + '/addresses.csv';

	// download data to cache if missing
	if (await exists(filename)) {
		logger.info('-> file already exists, skipping')
	} else {
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
		await writeToPath(filename, filtered, {
			delimiter: ';',
			headers: ['zoneName', 'houseNumber', 'streetName', 'cityCode']
		});
	}

	// return data from cache
	const addresses: Addresses = {};
	for await (const row of parseFile(filename, { delimiter: ';', headers: true })) {
		const { zoneName, houseNumber, streetName, cityCode } = row;
		addresses[zoneName] = (addresses[zoneName] ?? []);
		addresses[zoneName].push([houseNumber, streetName, cityCode]);
	}
	return addresses;
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

async function generateMock(addresses: Addresses, coefficients: Coefficients) {
	logger.info('generating mock data');

	const zones = Object.keys(addresses);

	const consumptionMock = openCsvOutputStream(mockDataDir + '/consumption.csv');
	await populateCsv(consumptionIterator(), consumptionMock);
	consumptionMock.end();

	const productionMock = openCsvOutputStream(mockDataDir + '/production.csv');
	await populateCsv(productionIterator(), productionMock);
	productionMock.end();

	function openCsvOutputStream(path: PathLike): CsvFormatterStream<any, any> {
		const stream = format({
			delimiter: ';',
			headers: ['timestamp', 'houseNumber', 'streetName', 'cityCode', 'profile', 'energy'],
		});
		stream.pipe(createWriteStream(path));
		return stream;
	}

	async function* consumptionIterator(): AsyncGenerator<Record<string, string>> {
		for (let i = 1; i <= 2; ++i) {
			for await (const line of readCsv(`${mockSrcDataDir}/consumption-part${i}.csv`)) {
				yield line;
			}
		}
	}

	async function* productionIterator(): AsyncGenerator<Record<string, string>> {
		for await (const line of readCsv(mockSrcDataDir + '/production.csv')) {
			yield line;
		}
	}

	async function populateCsv(dataSrc: AsyncGenerator<Record<string, string>>, outStream: CsvFormatterStream<any, any>) {
		for await (const line of dataSrc) {
			const zone = randomElement(zones);
			const address = randomElement(addresses[zone]);

			const profileStr = line['Profil'] ?? line['Filière de production'];
			let profile: ConsumerProfile | ProducerProfile = null;

			if (profileStr === 'PRO5') {
				profile = ConsumerProfile.PUBLIC_LIGHTING;
			} else if (profileStr.startsWith('PRO')) {
				profile = ConsumerProfile.PROFESSIONAL;
			} else if (profileStr.startsWith('RES')) {
				profile = ConsumerProfile.RESIDENTIAL;
			} else if (profileStr.startsWith('ENT')) {
				profile = ConsumerProfile.TERTIARY;
			} else if (profileStr.endsWith('Bioénergies')) {
				profile = ProducerProfile.BIOENERGY;
			} else if (profileStr.endsWith('Eolien')) {
				profile = ProducerProfile.EOLIAN;
			} else if (profileStr.endsWith('Hydraulique')) {
				profile = ProducerProfile.HYDRAULIC;
			} else if (profileStr.endsWith('Thermique non renouvelable')) {
				profile = ProducerProfile.NON_RENEWABLE_THERMAL;
			} else if (profileStr.endsWith('Autres')) {
				profile = ProducerProfile.OTHER;
			} else if (profileStr.endsWith('Solaire')) {
				profile = ProducerProfile.SOLAR;
			} else if (profileStr.endsWith('Total toutes filières')) {
				profile = ProducerProfile.TOTAL;
			}

			const energy = Math.round(
				parseInt(line['Total énergie soutirée (Wh)'] ?? line['Total énergie injectée (Wh)'], 10)
				* coefficients[zone][profile]
				/ 1_000_000
			);
			if (!energy) {
				continue;
			}

			outStream.write([line['Horodate'], ...address, profileStr, energy]);
		}
	}
}
