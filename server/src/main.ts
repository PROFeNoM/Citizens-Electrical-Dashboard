import { connectToDB } from './db/connection';

main().catch(console.error);

async function main() {
	await connectToDB(false);
	process.on('SIGINT', () => process.exit(0));
}
