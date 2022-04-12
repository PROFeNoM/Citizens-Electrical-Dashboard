import { mkdir } from 'fs/promises';
import * as download from 'download';
import { logger } from '../logger';
import { format, parseString } from 'fast-csv';
import * as FormData from 'form-data';
import axios from 'axios';
import { EOL } from 'os';
import { createWriteStream } from 'fs';
import { exists, mockSrcDataDir } from './utils';

const timestampStart = '2021-06-01T00:00:00Z';
const timestampEnd = '2021-12-31T23:30:00Z';

main().catch(console.error);

async function main() {
	await mkdir(mockSrcDataDir, { recursive: true });
	await downloadConsAndProdData();
	await downloadRandomAddresses();
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

async function downloadRandomAddresses() {
	logger.info(`downloading random addresses`);

	if (await exists(mockSrcDataDir + '/addresses.csv')) {
		logger.info('-> file already exists, skipping')
		return
	}

	const NW = [44.85167061339378, -0.5671098076715935];
	const SE = [44.83706864026471, -0.5441770324348592];

	const n = 25;
	const latStep = (SE[0] - NW[0]) / n;
	const longStep = (SE[1] - NW[1]) / n;

	let csv = 'latitude;longitude\n';
	for (let lat = NW[0]; lat > SE[0]; lat += latStep) {
		for (let long = NW[1]; long < SE[1]; long += longStep) {
			csv += `${lat};${long}\n`
		}
	}

	const form = new FormData();
	form.append('data', csv, { filename: 'data.csv' });
	const res = await axios.post('https://api-adresse.data.gouv.fr/reverse/csv', form, { headers: form.getHeaders() })

	const addresses = parseString((res.data as string)
		.split('\n')
		.join(EOL), { headers: true, delimiter: ';' });

	const outStream = format({ delimiter: ';' });
	outStream.pipe(createWriteStream(mockSrcDataDir + 'addresses.csv'));

	for await (const a of addresses) {
		outStream.write([a.result_housenumber, a.result_name, a.result_citycode]);
	}

	outStream.end();
}
