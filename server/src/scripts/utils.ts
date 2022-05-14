import {createWriteStream, PathLike, stat} from 'fs';
import { logger } from '../logger';
import {CsvFormatterStream, format, parseFile, parseString, writeToPath} from 'fast-csv';
import * as FormData from "form-data";
import axios from "axios";
import {EOL} from "os";
import * as turf from "@turf/turf";
import {FeatureCollection, MultiPolygon} from "@turf/turf";
import {ConsumerProfile} from "../db/entities/Consumption";
import {ProducerProfile} from "../db/entities/Production";
import {EntityManager} from "typeorm";
import {Zone} from "../db/entities/Zone";
import {DataTable} from "../db/entities/DataTable";
import {createHash} from "crypto";
import { config } from '../config';

export const dataDir = 'raw-data'
export const mockDataDir = dataDir + '/mock'
export const mockSrcDataDir = dataDir + '/mock-src'

const zonesGeodata = require(config.geodataDirFromUtils + '/zones.json') as FeatureCollection<MultiPolygon>;

export function exists(path: PathLike): Promise<boolean> {
	return new Promise((resolve, reject) => {
		stat(path, err => {
			if (err == null) {
				resolve(true);
			} else if (err.code == 'ENOENT') {
				resolve(false);
			} else {
				reject(err);
			}
		});
	});
}

export function randomElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

export function readCsv(path: string, delimiter: string = ';') {
	logger.info(`parsing ${path}`);

	return parseFile(path, {
		headers: true,
		delimiter: delimiter,
	});
}


/*******************************************/
/*                                         */
/*               MOCK DATA                 */
/*                                         */
/*******************************************/

export type Addresses = Record<string, string[][]>;
export type Coefficients = Record<string, Record<ConsumerProfile | ProducerProfile, number>>;

export async function downloadRandomAddresses(): Promise<Addresses> {
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
			for (const zone of zonesGeodata.features) {
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
export function getCoefficients(): Coefficients {
	const coefficients: Coefficients = {};

	for (const zone of zonesGeodata.features) {
		const coeff = coefficients[zone.properties.libelle] = {} as Record<string, number>;
		coeff[ConsumerProfile.PROFESSIONAL] = zone.properties.PRO1 + zone.properties.PRO2;
		coeff[ConsumerProfile.RESIDENTIAL] = zone.properties.RES1 + zone.properties.RES2;
		coeff[ConsumerProfile.TERTIARY] = zone.properties.ENT;
		coeff[ConsumerProfile.PUBLIC_LIGHTING] = Math.round(turf.area(zone) / 10_000);
		coeff[ProducerProfile.SOLAR] = zone.properties.PROD_F5;
	}

	return coefficients;
}

export async function generateMock(addresses: Addresses, coefficients: Coefficients,
								   outputPath: string, iterator: () => AsyncGenerator<Record<string, string>>) {
	logger.info('generating mock data');

	const zones = Object.keys(addresses);

	const dataMock = openCsvOutputStream(outputPath);
	await populateCsv(iterator(), dataMock);
	dataMock.end();

	function openCsvOutputStream(path: PathLike): CsvFormatterStream<any, any> {
		const stream = format({
			delimiter: ';',
			headers: ['timestamp', 'houseNumber', 'streetName', 'cityCode', 'profile', 'energy'],
		});
		stream.pipe(createWriteStream(path));
		return stream;
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

/*******************************************/
/*                                         */
/*               LOAD DATA                 */
/*                                         */
/*******************************************/

interface Coordinates {
	long: number,
	lat: number,
}

interface Address {
	houseNumber: string,
	streetName: string,
	cityCode: string,
}

interface AddressResolutionCtx {
	address: Address,
	callback: () => void,
	promise: Promise<void>,
}

const batchSize = 1000;

export async function getZones(tx: EntityManager): Promise<Record<string, Zone>> {
	const zones: Record<string, Zone> = {};

	for (const zoneGeodata of zonesGeodata.features) {
		const zoneName = zoneGeodata.properties.libelle;

		let zone = await tx.findOne(Zone, { where: { name: zoneName }});
		if (zone == null) {
			zone = new Zone();
			zone.name = zoneName;
			await tx.save(zone);
		}

		zones[zoneName] = zone;
	}

	return zones;
}

export async function loadCsvToTable<P>(tx: EntityManager, path: string, tableType: new () => DataTable<P>, profileParser: (raw: string) => P, zones: Record<string, Zone>, prediction: boolean = false, predBatchSize: number = 100) {
	let jobs: Promise<void>[] = [];
	let batchIndex = 0;
	let jobIndexInBatch = 0;
	const _batchSize = prediction ? predBatchSize : batchSize;
	for await (const line of readCsv(path)) {
		// if about to start a third batch, terminate the first one so only a max of 2 are running concurrently
		if (jobs.length === 2 * _batchSize) {
			await Promise.all(jobs.splice(0, _batchSize));
		}

		// push a new job
		jobs.push((async () => {
			const entry = new tableType();
			entry.timestamp = new Date(line.timestamp);
			entry.profile = profileParser(line.profile);
			entry.energy = parseInt(line.energy, 10);
			entry.prediction = prediction;
			entry.zone = await getZoneFromAddress(zones, {
				houseNumber: line.houseNumber,
				streetName: line.streetName,
				cityCode: line.cityCode,
			}, batchIndex, _batchSize);

			if (entry.zone === null) {
				// logger.warn('failed to map address to zone');
				return;
			}

			await tx.save(entry);
		})());

		// keep track of batch and job indices
		if (++jobIndexInBatch == _batchSize) {
			jobIndexInBatch = 0;
			++batchIndex;
		}
	}

	// shameful hackS enclosed in curly braces of shame
	{
		// Make the getCoordinatesFromAddress function "think" that it's called a number of time that is a multiple of
		// batchSize, so that the final call to the resolveAddresses function can be made.
		nbOfCallsPerBatch[batchIndex] = (nbOfCallsPerBatch[batchIndex] ?? 0) + _batchSize - jobIndexInBatch - 1;
		// But wait, what if no more calls to the getCoordinatesFromAddress function will be made? Then we have to do
		// its job of making the final call to the resolveAddresses function.
		if (nbOfCallsPerBatch[batchIndex] === _batchSize || nbOfCallsPerBatch[batchIndex] === _batchSize - 1) {
			const tmp = addressesToResolve;
			addressesToResolve = {};
			await resolveAddresses(tmp);
		}
		// The good way of implementing all those tasks/jobs/batches would be to use some kind of library.
	}

	await Promise.all(jobs);
}

async function getZoneFromAddress(zones: Record<string, Zone>, address: Address, batchIndex: number, _batchSize: number): Promise<Zone | null> {
	const coo = await getCoordinatesFromAddress(address, batchIndex, _batchSize);
	const point = turf.point([coo.long, coo.lat]);

	let zoneName: string | null = null;
	for (const zoneGeodata of zonesGeodata.features) {
		if (turf.booleanContains({ type: 'Polygon', coordinates: zoneGeodata.geometry.coordinates[0] }, point)) {
			zoneName = zoneGeodata.properties.libelle;
			break;
		}
	}

	if (zoneName === null || zones[zoneName] === undefined) {
		return null;
	}

	return zones[zoneName];
}

const addressCache: Record<string, Coordinates> = {};
const nbOfCallsPerBatch: number[] = [];
let addressesToResolve: Record<string, AddressResolutionCtx> = {};

async function getCoordinatesFromAddress(address: Address, batchIndex: number, _batchSize: number): Promise<Coordinates> {
	// keep track of how many times this function was called for each batch
	nbOfCallsPerBatch[batchIndex] = (nbOfCallsPerBatch[batchIndex] ?? 0) + 1;

	// compute a unique ID for this address (hash)
	const hash = createHash('sha256')
		.update(JSON.stringify([address.houseNumber, address.streetName, address.cityCode]))
		.digest('hex');

	// promise signaling when the address is resolved, if not already present in the cache
	let onResolved: Promise<void> | null = null;

	// if the address isn't present in the cache, resolve it
	if (addressCache[hash] === undefined) {
		// Actually, the following don't directly resolve the address, but rather store it in "addressesToResolve".
		// The address resolution is done later.
		if (addressesToResolve[hash] === undefined) {
			onResolved = new Promise<void>(callback => {
				addressesToResolve[hash] = { address, callback, promise: null };
			});
			addressesToResolve[hash].promise = onResolved;
		} else {
			onResolved = addressesToResolve[hash].promise;
		}
	}

	// If all jobs of the current batch called this function, then it's time to resolve all the addresses.
	if (nbOfCallsPerBatch[batchIndex] == _batchSize) {
		// resolve addresses with one API call for the whole batch (and probably a bit of the next batch), instead of flooding the API
		const tmp = addressesToResolve;
		addressesToResolve = {};
		await resolveAddresses(tmp);
	}

	// wait for the address to be resolved
	if (onResolved !== null) {
		await onResolved;
	}

	return addressCache[hash];
}

async function resolveAddresses(toResolve: Record<string, AddressResolutionCtx>): Promise<void> {
	const qtyToResolve = Object.keys(toResolve).length;

	if (qtyToResolve === 0) {
		return;
	}

	logger.info(`resolving ${qtyToResolve} addresses`);

	const stream = format({
		delimiter: ';',
		headers: ['hash', 'houseNumber', 'streetName', 'cityCode'],
	});

	const form = new FormData();
	form.append('columns', 'houseNumber');
	form.append('columns', 'streetName');
	form.append('citycode', 'cityCode');
	form.append('data', stream, { filename: 'data.csv' });
	const req = axios.post('https://api-adresse.data.gouv.fr/search/csv', form, { headers: form.getHeaders() })

	for (const hash in toResolve) {
		const { houseNumber, streetName, cityCode } = toResolve[hash].address;
		stream.write([hash, houseNumber, streetName, cityCode]);
	}
	stream.end();

	const res = await req;

	const parsedRes = parseString((res.data as string)
		.split('\n')
		.join(EOL), { headers: true, delimiter: ';' });

	for await (const line of parsedRes) {
		const hash = line.hash;
		const long = parseFloat(line.longitude);
		const lat = parseFloat(line.latitude);
		addressCache[hash] = { long, lat };
		toResolve[hash].callback();
	}
}

export function parseConsumerProfile(raw: string): ConsumerProfile {
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

export function parseProducerProfile(raw: string): ProducerProfile {
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

