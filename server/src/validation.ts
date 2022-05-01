import { NextFunction, Request, Response } from 'express';
import { ProducerProfile, Production } from './db/entities/Production';
import { ConsumerProfile, Consumption } from './db/entities/Consumption';
import { getManager } from 'typeorm';
import { Zone } from './db/entities/Zone';

// the apiReqCheckerParser middleware will create the following fields by side effect
declare global {
	namespace Express {
		interface Request {
			entity: typeof Production | typeof Consumption,
			profileEnum: typeof ProducerProfile | typeof ConsumerProfile,
			minDate: Date,
			maxDate: Date,
			profiles: (ProducerProfile | ConsumerProfile)[],
			zoneId: number | undefined,
		}
	}
}

export async function apiReqCheckerParser(req: Request, res: Response, next: NextFunction) {
	let entity: typeof Production | typeof  Consumption;
	let profileEnum: typeof ProducerProfile | typeof ConsumerProfile;

	if (req.params.entity === 'production') {
		entity = Production;
		profileEnum = ProducerProfile;
	} else if (req.params.entity === 'consumption') {
		entity = Consumption;
		profileEnum = ConsumerProfile;
	} else {
		res.status(400).send('unknown entity: ' + req.params.entity);
		return;
	}

	const minDate = checkAndParseDate(req.query.minDate);
	if (minDate === null) {
		res.status(400).send('minDate is missing from query or is invalid');
		return;
	}

	const maxDate = checkAndParseDate(req.query.maxDate);
	if (maxDate === null) {
		res.status(400).send('maxDate is missing from query or is invalid');
		return;
	}

	const profiles = checkAndParseEnumArray(req.query.profiles ?? [], profileEnum);
	if (profiles === null) {
		res.status(400).send('profiles array is invalid');
		return;
	}

	const zoneName = req.query.zone;
	let zoneId: number | undefined;
	// zone isn't required but if it's defined it must be valid
	if (zoneName !== undefined) {
		if (typeof zoneName !== 'string') {
			res.status(400).send('zone is invalid');
			return;
		}

		const zone = await getManager().findOne(Zone, { where: { name: zoneName }});
		if (zone === undefined) {
			res.status(400).send('the given zone is not known');
			return;
		}

		zoneId = zone.id;
	}

	req.entity = entity;
	req.profileEnum = profileEnum;
	req.minDate = minDate;
	req.maxDate = maxDate;
	req.profiles = profiles;
	req.zoneId = zoneId;

	next();
}

function checkAndParseDate(input: any): Date | null {
	if (typeof input !== 'string') {
		return null;
	}
	if (!input.match(/^\d+$/)) {
		return null;
	}
	return new Date(parseInt(input, 10));
}

function checkAndParseEnumArray(input: any, enumDef: any): (ProducerProfile | ConsumerProfile)[] | null {
	// input should be an array
	if (!Array.isArray(input)) {
		return null;
	}

	// input should be a string array
	for (const elem of input) {
		if (typeof elem !== 'string') {
			return null;
		}
	}

	const accepted = Object.keys(enumDef);

	// shortcut
	if (input.length > accepted.length) {
		return null;
	}

	// check that there is no duplicate
	if (new Set(input).size !== input.length) {
		return null;
	}

	// check that there is only valid values
	for (const elem of input) {
		if (!accepted.includes(elem)) {
			return null;
		}
	}

	return input;
}
