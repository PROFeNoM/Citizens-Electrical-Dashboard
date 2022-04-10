import {
	readCsv,
	createConsumptionRecord,
	createProductionRecord} from "./load";
import { connectToDB } from "./connection";
import { logger } from "../logger";
import { getConnection } from "typeorm";

// Parse the arguments passed to the script
// Usage: node load_predictions.js <file_path> <production|consumption>
const [, , filePath, type] = process.argv;

main(filePath, type).catch(console.error);

async function main(filePath: string, type: string) {
	logger.info(`loading ${type} predictions from ${filePath}`);
	const data = readCsv(filePath);
	await connectToDB();
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