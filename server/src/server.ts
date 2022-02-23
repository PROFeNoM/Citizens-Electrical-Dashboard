import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { ConsumerProfile, Consumption } from './db/entities/Consumption';
import { query, validationResult } from 'express-validator';
import { ProducerProfile, Production } from './db/entities/Production';
import { logger } from './logger';

const port = 5000;

const app = express();
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());

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

			if (profiles) {
				query = query.andWhere('x.profile IN (:...profiles)', { profiles });
			}

			res.send(await query.getRawMany());
		});
}

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
	await new Promise<void>(resolve => app.listen(port, resolve));
	logger.info(`server has started on port ${port}`);
}
