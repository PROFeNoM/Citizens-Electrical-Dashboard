import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { resolve } from 'path';
import { getConnection } from 'typeorm';
import { ConsumerProfile, Consumption } from './db/entities/Consumption';
import { query, validationResult } from 'express-validator';
import { ProducerProfile, Production } from './db/entities/Production';
import { logger } from './logger';
import { config } from './config';

const app = express();
const cors = require('cors');
const wwwDir = resolve(process.env.NODE_ENV === 'production' ? 'www' : '../client/build');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(wwwDir));

// examples: http://localhost:5000/consumption?minDate=1609455600000&maxDate=1609459200000

const routes = [
	{
		endpoint: '/consumption',
		entity: Consumption,
		profileEnum: ConsumerProfile,
		fields: 'timestamp, profile, drain_points, drained_energy, mean_curve',
	},
	{
		endpoint: '/production',
		entity: Production,
		profileEnum: ProducerProfile,
		fields: 'timestamp, profile, injection_points, injected_energy, mean_curve',
	}
]

for (const route of routes) {
	app.get(route.endpoint,
		query('minDate').matches(/\d+/),
		query('maxDate').matches(/\d+/),
		query('profiles').optional().isArray().custom(input => isEnumArray(input, route.profileEnum)),
		checkRequest,
		async (req, res) => {
			const minDate = new Date(parseInt(req.query.minDate as string, 10));
			const maxDate = new Date(parseInt(req.query.maxDate as string, 10));
			const profiles = req.query.profiles;

			let query = await getConnection().createQueryBuilder()
				.select(route.fields)
				.from(route.entity, 'x')
				.where('x.timestamp between :minDate and :maxDate', { minDate, maxDate });

			if (profiles && profiles.length < Object.keys(route.profileEnum).length) {
				query = query.andWhere('x.profile IN (:...profiles)', { profiles });
			}

			res.send(await query.getRawMany());
		});
}


app.get('*', (req, res) => {
	res.sendFile(wwwDir + '/index.html');
});


function isEnumArray(input: string[], enumDef: object) {
	const accepted = Object.keys(enumDef);

	// shortcut
	if (input.length > accepted.length) {
		return false;
	}

	// check that there is no duplicate
	if (new Set(input).size !== input.length) {
		return false;
	}

	// check that there is only valid values
	for (const elem of input) {
		if (!accepted.includes(elem)) {
			return false;
		}
	}

	return true;
}

function checkRequest(req: Request, res: Response, next: NextFunction) {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		next();
	} else {
		res.status(400).json({ errors: errors.array() });
	}
}

export async function startServer() {
	await new Promise<void>(resolve => app.listen(config.webServer.port, resolve));
	logger.info(`server has started on port ${config.webServer.port}`);
}
