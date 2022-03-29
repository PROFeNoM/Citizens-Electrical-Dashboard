import { NextFunction, Request, Response } from 'express';
import { ProducerProfile, Production } from './db/entities/Production';
import { ConsumerProfile, Consumption } from './db/entities/Consumption';

// TODO clean that
export type Zone = 'Bastide Niel' | 'Quartier historique Nord Thiers' | 'Coeur de Bastide' | 'sieges sociaux' | 'residence autre quai' | 'batiments publics' | 'batiments professionnels et residentiels' | 'mixte urbain' | 'quartier historique sud avenue thiers';
const zones: Zone[] = ['Bastide Niel', 'Quartier historique Nord Thiers', 'Coeur de Bastide', 'sieges sociaux', 'residence autre quai', 'batiments publics', 'batiments professionnels et residentiels', 'mixte urbain', 'quartier historique sud avenue thiers'];

// the apiReqCheckerParser middleware will create the following fields by side effect
declare global {
	namespace Express {
		interface Request {
			entity: typeof Production | typeof Consumption,
			profileEnum: typeof ProducerProfile | typeof ConsumerProfile,
			minDate: Date,
			maxDate: Date,
			profiles: (ProducerProfile | ConsumerProfile)[],
			zone: Zone | undefined,
		}
	}
}

export function apiReqCheckerParser(req: Request, res: Response, next: NextFunction) {
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

	const zone = req.query.zone;
	// zone isn't required but if it's defined it must be valid
	if (zone !== undefined && !zones.includes(zone as any)) {
		res.status(400).send('zone is invalid');
		return;
	}

	req.entity = entity;
	req.profileEnum = profileEnum;
	req.minDate = minDate;
	req.maxDate = maxDate;
	req.profiles = profiles;
	req.zone = zone as Zone;

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
