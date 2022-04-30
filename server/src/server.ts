import * as express from 'express';
import { resolve } from 'path';
import { getConnection } from 'typeorm';
import { logger } from './logger';
import { config } from './config';
import { apiReqCheckerParser } from './validation';

const app = express();
const wwwDir = resolve(config.devMode ? '../client/build' : 'www');

if (config.devMode) {
	app.use(require('cors')());
}

// middleware
app.use(express.json());
app.use(express.static(wwwDir));

app.get('/api/v1/:entity/total', apiReqCheckerParser, async (req, res) => {
	let query = await getConnection().createQueryBuilder()
		.select('sum(energy) AS total')
		.from(req.entity, 'e')
		.where('e.timestamp BETWEEN :minDate AND :maxDate', { minDate: req.minDate, maxDate: req.maxDate });

	if (req.zoneId !== undefined) {
		query = query.andWhere('e.zoneId = :zoneId', { zoneId: req.zoneId });
	}

	if (req.profiles.length > 0) {
		query = query.andWhere('e.profile IN (:...profiles)', { profiles: req.profiles });
	}

	const result = await query.getRawOne() as { total: number };

	res.send(result);
});

app.get('/api/v1/:entity/hourly-mean', apiReqCheckerParser, async (req, res) => {
	let query = await getConnection().createQueryBuilder()
		.select('extract(hour from timestamp)::int AS hour, avg(energy) * 2 AS mean') // multiplying by 2, because each line correspond to 30 min and not 1 hour
		.from(req.entity, 'e')
		.groupBy('hour')
		.where('e.timestamp BETWEEN :minDate AND :maxDate', { minDate: req.minDate, maxDate: req.maxDate })
		.orderBy('hour');

	if (req.zoneId !== undefined) {
		query = query.andWhere('e.zoneId = :zoneId', { zoneId: req.zoneId });
	}

	if (req.profiles.length > 0) {
		query = query.andWhere('e.profile IN (:...profiles)', { profiles: req.profiles });
	}

	let result = await query.getRawMany() as { hour: number, mean: number }[];

	res.send(result);
});

app.get('/api/*', (req, res) => {
	res.status(404).send();
})

// FIXME every non API call will result in a 200 response, this isn't a good practice
app.get('*', (req, res) => {
	res.sendFile(wwwDir + '/index.html');
});

export async function startServer() {
	await new Promise<void>(resolve => app.listen(config.webServer.port, resolve));
	logger.info(`server has started on port ${config.webServer.port}`);
}
