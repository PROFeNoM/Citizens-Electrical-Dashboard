import { connectToDB } from './db/connection';
import { startServer } from './server';

main().catch(console.error);

async function main() {
	await connectToDB();
	await startServer();
	process.on('SIGINT', () => process.exit(0));
}
