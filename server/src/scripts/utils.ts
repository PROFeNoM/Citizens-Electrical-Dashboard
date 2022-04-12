import { PathLike, stat } from 'fs';
import { logger } from '../logger';
import { parseFile } from 'fast-csv';

export const dataDir = 'raw-data'
export const mockDataDir = dataDir + '/mock'
export const mockSrcDataDir = dataDir + '/mock-src'

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

export function readCsv(path: string) {
	logger.info(`parsing ${path}`);

	return parseFile(path, {
		headers: true,
		delimiter: ';',
	});
}
