import * as download from 'download';
import { logger } from '../logger';
import { exists, mockDataDir, mockSrcDataDir, readCsv,
	downloadRandomAddresses, getCoefficients, generateMock } from './utils';
import { mkdir } from 'fs/promises';

const timestampStart = '2021-06-01T00:00:00Z';
const timestampEnd = '2021-12-31T23:30:00Z';

main().catch(console.error);

async function main() {
	await mkdir(mockSrcDataDir, { recursive: true });
	await mkdir(mockDataDir, { recursive: true });
	await downloadConsAndProdData();
	const addresses = await downloadRandomAddresses();
	const coefficients = getCoefficients();
	await generateMock(addresses, coefficients, mockDataDir + '/consumption.csv', consumptionIterator);
	await generateMock(addresses, coefficients, mockDataDir + '/production.csv', productionIterator);
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