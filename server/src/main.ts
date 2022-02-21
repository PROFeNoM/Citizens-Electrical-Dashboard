import { connectToDB } from './orm/connection';

main().catch(console.error);

async function main() {
	await connectToDB();
	process.on('SIGINT', () => process.exit(0));
}
