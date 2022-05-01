import {downloadRandomAddresses, generateMock, getCoefficients, readCsv} from "./utils";
import {logger} from "../logger";

// Usage:
// node generate-mock-prediction.js <srcPath> <destPath> <consumption|production>

// Retrieve the command line arguments
const srcPath = process.argv[2];
const destPath = process.argv[3];

main().catch(console.error);

async function main() {
	const addresses = await downloadRandomAddresses();
	const coefficients = getCoefficients();
	await generateMock(addresses, coefficients, destPath, predictionIterator);
	logger.info('done!');
}

async function* predictionIterator(): AsyncGenerator<Record<string, string>> {
	for await (const line of readCsv(srcPath, ',')) {
		yield line;
	}
}