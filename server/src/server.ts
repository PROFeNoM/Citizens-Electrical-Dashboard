import * as express from 'express';
import { getConnection } from 'typeorm';
import { Consumption } from './db/entities/Consumption';

const app = express();
const cors = require('cors');

// middleware
app.use(cors());
app.use(express.json());

// ROUTES //

// get all consumption data
app.get('/consumption', async (_req, res) => {
	const data = await getConnection().createQueryBuilder()
		.select('*')
		.from(Consumption, 'c')
		.getRawMany()

	res.json(data);
});
/*
// use example: http://localhost:5000/urbanZoneElectricityConsumption?profile=RES1&t1='2021-09-30 23:30:00'
app.get('/urbanZoneElectricityConsumption', async (req: any, res: { json: (arg0: any) => void; }) => {
	try {
		const profile: string = req.query.profile;
		const t1: string = req.query.t1;
		const t2: string = req.query.t2;
		const horodatageCond: string = !t2 ? `= ${t1}` : `between ${t1} and ${t2}`;
		const allConso = await pool.query(
			`select avg(COURBE_MOYENNE) as COURBE_MOYENNE
             from CONSO_INF36_REGION
             where PROFIL like '${profile}%'
               and HORODATAGE ${horodatageCond}
             group by HORODATAGE`);
		res.json(allConso.rows);
	} catch (e: any) {
		console.error(e.message);
	}
});

// use example: http://localhost:5000/urbanZoneElectricityConsumptionTertiary?t1='2021-09-30 23:30:00'
app.get('/urbanZoneElectricityConsumptionTertiary', async (req: any, res: { json: (arg0: any) => void; }) => {
	try {
		const t1: string = req.query.t1;
		const t2: string = req.query.t2;
		const horodatageCond: string = !t2 ? `= ${t1}` : `between ${t1} and ${t2}`;
		const allConso = await pool.query(
			`select sum(NB_POINT_SOUTIRAGE * COURBE_MOYENNE) / sum(NB_POINT_SOUTIRAGE) as COURBE_MOYENNE
             from CONSO_SUP36_REGION
             where HORODATAGE ${horodatageCond}
             group by HORODATAGE;`);
		res.json(allConso.rows);
	} catch (e: any) {
		console.error(e.message);
	}
});


// use example: http://localhost:5000/urbanZoneElectricityProduction?t1='2021-09-30 13:00:00'&t2='2021-09-30 23:30:00'
app.get('/urbanZoneElectricityProduction', async (req: any, res: { json: (arg0: any) => void; }) => {
	try {
		const t1: string = req.query.t1;
		const t2: string = req.query.t2;
		const horodatageCond: string = !t2 ? `= ${t1}` : `between ${t1} and ${t2}`;
		const allConso = await pool.query(
			`select avg(TOTAL_ENERGIE_INJECTEE / NB_POINT_INJECTION) as MOYENNE
             from PROD_REGION
             where HORODATAGE ${horodatageCond}`);
		res.json(allConso.rows);
	} catch (e: any) {
		console.error(e.message);
	}
});
*/
export async function startServer() {
	await new Promise<void>(resolve => {
		app.listen(5000, () => {
			console.log('server has started on port 5000');
			resolve();
		});
	});
}
