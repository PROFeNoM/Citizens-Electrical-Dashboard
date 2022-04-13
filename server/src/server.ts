import * as express from 'express';
import { resolve } from 'path';
import {getConnection, SelectQueryBuilder} from 'typeorm';
import { logger } from './logger';
import { config } from './config';
import { apiReqCheckerParser } from './validation';
import { regionDataToDistrictData, regionDataToZoneData } from './mock';

const app = express();
const cors = require('cors');
const wwwDir = resolve(process.env.NODE_ENV === 'production' ? 'www' : '../client/build');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(wwwDir));

app.get('/api/v1/:entity/total', apiReqCheckerParser, async (req, res) => {
	// TODO clean that
	let field = req.params.entity === 'consumption'
		? 'drained_energy'
		: 'injected_energy';

	// Get the maximum timestamp in the database where the field is_prediction is false
	const maxTimestamp = await getConnection()
		.createQueryBuilder()
		.select(`MAX(timestamp)`)
		.from(`${req.params.entity}`, `${req.params.entity}`)
		.where(`is_prediction = false`)
		.getRawOne();

	let query: SelectQueryBuilder<any>;
	let result: { total: number };
	console.log(req.maxDate, maxTimestamp.max, req.maxDate < maxTimestamp.max);
	if (req.maxDate < maxTimestamp.max) {
		query = await getConnection().createQueryBuilder()
			.select(`sum(${field}) AS total`)
			.from(req.entity, 'x')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', { minDate: req.minDate, maxDate: req.maxDate })
			.andWhere('x.isPrediction IS FALSE')
		if (req.profiles.length > 0) {
			query = query.andWhere('x.profile IN (:...profiles)', { profiles: req.profiles });
		}

		result = await query.getRawOne() as { total: number }
	} else {
		let actualRecordsQuery = await getConnection().createQueryBuilder()
			.select(`sum(${field}) AS total`)
			.from(req.entity, 'x')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', { minDate: req.minDate, maxDate: maxTimestamp.max })
			.andWhere('x.isPrediction IS FALSE', {});
		let predictionRecordsQuery = await getConnection().createQueryBuilder()
			.select(`sum(${field}) AS total`)
			.from(req.entity, 'x')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', { minDate: maxTimestamp.max, maxDate: req.maxDate })
			.andWhere('x.isPrediction IS TRUE', {});
		if (req.profiles.length > 0) {
			actualRecordsQuery = actualRecordsQuery.andWhere('x.profile IN (:...profiles)', { profiles: req.profiles });
			predictionRecordsQuery = predictionRecordsQuery.andWhere('x.profile IN (:...profiles)', { profiles: req.profiles });
		}

		result = {
			total: (await actualRecordsQuery.getRawOne() as { total: number }).total + (await predictionRecordsQuery.getRawOne() as { total: number }).total
		}
	}

	// TODO don't use a mock
	if (req.zone) {
		result.total = regionDataToZoneData(req.zone, result.total);
	} else {
		result.total = regionDataToDistrictData(result.total);
	}

	res.send(result);
});

app.get('/api/v1/:entity/hourly-mean', apiReqCheckerParser, async (req, res) => {
	// TODO clean that
	let field = req.params.entity === 'consumption'
		? 'drained_energy'
		: 'injected_energy';

	// Get the maximum timestamp in the database where the field is_prediction is false
	const maxTimestamp = await getConnection()
		.createQueryBuilder()
		.select(`MAX(timestamp)`)
		.from(`${req.params.entity}`, `${req.params.entity}`)
		.where(`is_prediction = false`)
		.getRawOne();

	let query: SelectQueryBuilder<any>;
	let result: { hour: number, mean: number }[];

	if (req.maxDate < maxTimestamp.max) {
		query = await getConnection().createQueryBuilder()
			.select(`extract(hour from timestamp)::int AS hour, avg(${field}) * 2 AS mean`)
			.from(req.entity, 'x')
			.groupBy('hour')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', { minDate: req.minDate, maxDate: req.maxDate })
			.andWhere('x.isPrediction IS FALSE', {})
			.orderBy('hour')
		if (req.profiles.length > 0) {
			query = query.andWhere('x.profile IN (:...profiles)', { profiles: req.profiles });
		}

		result = await query.getRawMany() as { hour: number, mean: number }[];
	} else {
		let actualRecordsQuery = await getConnection().createQueryBuilder()
			.select(`extract(hour from timestamp)::int AS hour, avg(${field}) * 2 AS mean`)
			.from(req.entity, 'x')
			.groupBy('hour')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', {minDate: req.minDate, maxDate: maxTimestamp.max})
			.andWhere('x.isPrediction IS FALSE', {})
			.orderBy('hour')
		let predictionRecordsQuery = await getConnection().createQueryBuilder()
			.select(`extract(hour from timestamp)::int AS hour, avg(${field}) * 2 AS mean`)
			.from(req.entity, 'x')
			.groupBy('hour')
			.where('x.timestamp BETWEEN :minDate AND :maxDate', {minDate: maxTimestamp.max, maxDate: req.maxDate})
			.andWhere('x.isPrediction IS TRUE', {})
			.orderBy('hour')
		if (req.profiles.length > 0) {
			actualRecordsQuery = actualRecordsQuery.andWhere('x.profile IN (:...profiles)', {profiles: req.profiles});
			predictionRecordsQuery = predictionRecordsQuery.andWhere('x.profile IN (:...profiles)', {profiles: req.profiles});
		}

		result = (await actualRecordsQuery.getRawMany() as { hour: number, mean: number }[])
			.concat(await predictionRecordsQuery.getRawMany() as { hour: number, mean: number }[])
	}

	// TODO don't use a mock
	result = result.map(({ hour, mean }) => {
		if (req.zone) {
			mean = regionDataToZoneData(req.zone, mean);
		} else {
			mean = regionDataToDistrictData(mean);
		}
		return { hour, mean };
	})

	res.send(result);
});

// TODO properly catch 404 requests

app.get('/api/*', (req, res) => {
	res.status(404).send();
})

app.get('*', (req, res) => {
	res.sendFile(wwwDir + '/index.html');
});

export async function startServer() {
	await new Promise<void>(resolve => app.listen(config.webServer.port, resolve));
	logger.info(`server has started on port ${config.webServer.port}`);
}
