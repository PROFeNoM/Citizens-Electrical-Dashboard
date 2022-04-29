import { EntityManager, getConnection } from 'typeorm';
import { ConsumerProfile, Consumption } from '../db/entities/Consumption';
import { ProducerProfile, Production } from '../db/entities/Production';
import { connectToDB } from '../db/connection';
import { mockDataDir, readCsv } from './utils';
import { DataTable } from '../db/entities/DataTable';
import { Zone } from '../db/entities/Zone';
import { format, parseString } from 'fast-csv';
import * as FormData from 'form-data';
import axios from 'axios';
import { EOL } from 'os';
import { createHash } from 'crypto';
import { logger } from '../logger';

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
	let batchIndex = 0;
	let jobIndexInBatch = 0;

	for await (const line of readCsv(path)) {
		// if about to start a third batch, terminate the first one so only a max of 2 are running concurrently
		if (jobs.length === 2 * batchSize) {
			await Promise.all(jobs.splice(0, batchSize));
		}

		// push a new job
		jobs.push((async () => {
			const entry = new tableType();
			entry.timestamp = new Date(line.timestamp);
			entry.profile = profileParser(line.profile);
			entry.energy = parseInt(line.energy, 10);
			entry.prediction = false;
			entry.zone = await getZoneFromAddress({
				houseNumber: line.houseNumber,
				streetName: line.streetName,
				cityCode: line.cityCode,
			}, batchIndex);
			await tx.save(entry);
		})());

		// keep track of batch and job indices
		if (++jobIndexInBatch == batchSize) {
			jobIndexInBatch = 0;
			++batchIndex;
		}
	}

	// shameful hackS enclosed in curly braces of shame
	{
		// Make the getCoordinatesFromAddress function "think" that it's called a number of time that is a multiple of
		// batchSize, so that the final call to the resolveAddresses function can be made.
		nbOfCallsPerBatch[batchIndex] = (nbOfCallsPerBatch[batchIndex] ?? 0) + batchSize - jobIndexInBatch - 1;
		// But wait, what if no more calls to the getCoordinatesFromAddress function will be made? Then we have to do
		// its job of making the final call to the resolveAddresses function.
		if (nbOfCallsPerBatch[batchIndex] === batchSize) {
			const tmp = addressesToResolve;
			addressesToResolve = {};
			await resolveAddresses(tmp);
		}
		// The good way of implementing all those tasks/jobs/batches would be to use some kind of library.
	}

	await Promise.all(jobs);
}

async function getZoneFromAddress(address: Address, batchIndex: number): Promise<Zone> {
	const coordinates = await getCoordinatesFromAddress(address, batchIndex);
	// TODO
	return null;
}

const addressCache: Record<string, Coordinates> = {};
const nbOfCallsPerBatch: number[] = [];
let addressesToResolve: Record<string, AddressResolutionCtx> = {};

async function getCoordinatesFromAddress(address: Address, batchIndex: number): Promise<Coordinates> {
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

	// If all jobs of the current batch called this function, then it's time to resolved all the addresses.
	if (nbOfCallsPerBatch[batchIndex] == batchSize) {
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
