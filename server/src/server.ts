import * as express from 'express';
import { resolve } from 'path';
import { getConnection } from 'typeorm';
import { logger } from './logger';
import { config } from './config';
import { apiReqCheckerParser } from './validation';

const app = express();
const cors = require('cors');
const wwwDir = resolve(process.env.NODE_ENV === 'production' ? 'www' : '../client/build');

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(wwwDir));

app.get('/api/v1/:entity', apiReqCheckerParser, async (req, res) => {
	let fields = req.params.entity === 'consumption'
		? 'timestamp, profile, drain_points, drained_energy, mean_curve'
		: 'timestamp, profile, injection_points, injected_energy, mean_curve';

	let query = await getConnection().createQueryBuilder()
		.select(fields)
		.from(req.entity, 'x')
		.where('x.timestamp between :minDate and :maxDate', { minDate: req.minDate, maxDate: req.maxDate });

	if (req.profiles.length > 0) {
		query = query.andWhere('x.profile IN (:...profiles)', { profiles: req.profiles });
	}

	res.send(await query.getRawMany());
});

app.get('*', (req, res) => {
	res.sendFile(wwwDir + '/index.html');
});

export async function startServer() {
	await new Promise<void>(resolve => app.listen(config.webServer.port, resolve));
	logger.info(`server has started on port ${config.webServer.port}`);
}
