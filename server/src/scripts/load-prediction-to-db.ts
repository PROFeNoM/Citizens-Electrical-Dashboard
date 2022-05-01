
// Usage:
// node load-prediction-to-db.js <srcPath> <consumption|production>

// Retrieve the command line arguments
import {connectToDB} from "../db/connection";
import {getConnection} from "typeorm";
import {getZones, loadCsvToTable, parseConsumerProfile, parseProducerProfile} from "./utils";
import {Production} from "../db/entities/Production";
import {Consumption} from "../db/entities/Consumption";

const srcPath = process.argv[2];
const type = process.argv[3];

main().catch(console.error);

async function main() {
  await connectToDB();
  await getConnection().transaction(async tx => {
	  const zones = await getZones(tx);

	  // Verify that the type is valid
	  if (type !== "production" && type !== "consumption") {
		  throw new Error("Invalid type: " + type + ". Must be production or consumption.");
	  }

	  if (type === "production") {
		  await loadCsvToTable(tx, srcPath, Production, parseProducerProfile, zones, true);
	  } else {
		  await loadCsvToTable(tx, srcPath, Consumption, parseConsumerProfile, zones, true);
	  }
  });
}