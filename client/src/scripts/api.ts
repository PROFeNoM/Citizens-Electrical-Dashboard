export enum ConsumerProfile {
	ALL = 'ALL',
	RESIDENTIAL = 'RESIDENTIAL',
	PROFESSIONAL = 'PROFESSIONAL',
	TERTIARY = 'TERTIARY',
	PUBLIC_LIGHTING = 'PUBLIC_LIGHTING'
}

export enum ProducerProfile {
	BIOENERGY = 'BIOENERGY',
	EOLIAN = 'EOLIAN',
	HYDRAULIC = 'HYDRAULIC',
	NON_RENEWABLE_THERMAL = 'NON_RENEWABLE_THERMAL',
	OTHER = 'OTHER',
	SOLAR = 'SOLAR',
	TOTAL = 'TOTAL',
}

export enum DataType {
	CONSUMPTION = 'CONSUMPTION',
	PRODUCTION = 'PRODUCTION',
}

/**
 * Get the total consumption in Wh on the given time period.
 * @param t1 start of the time period (Unix epoch millis)
 * @param t2 end of the time period (Unix epoch millis)
 * @param profiles list of profiles to consider. If nullish or empty, all profile are considered
 * @param zoneName the urban zone to consider. If nullish the whole district is considered
 */
export async function getTotalConsumption(t1: number, t2: number, profiles?: ConsumerProfile[], zoneName?: string): Promise<number> {
	const result = await apiCall('consumption/total', t1, t2, profiles, zoneName) as { total: number };
	return result.total;
}

/**
 * Get the total production in Wh on the given time period.
 * @param t1 start of the time period (Unix epoch millis)
 * @param t2 end of the time period (Unix epoch millis)
 * @param profiles list of profiles to consider. If nullish or empty, all profile are considered
 * @param zoneName the urban zone to consider. If nullish the whole district is considered
 */
export async function getTotalProduction(t1: number, t2: number, profiles?: ProducerProfile[], zoneName?: string): Promise<number> {
	const result = await apiCall('production/total', t1, t2, profiles, zoneName) as { total: number };
	return result.total;
}

/**
 * Get the average consumption in Wh for each hour of the day on the given time period.
 * @param t1 start of the time period (Unix epoch millis)
 * @param t2 end of the time period (Unix epoch millis)
 * @param profiles list of profiles to consider. If nullish or empty, all profile are considered
 * @param zoneName the urban zone to consider. If nullish the whole district is considered
 */
export async function getHourlyMeanConsumption(t1: number, t2: number, profiles?: ConsumerProfile[], zoneName?: string): Promise<{ hour: Date; mean: number }[]> {
	const result = await apiCall('consumption/hourly-mean', t1, t2, profiles, zoneName) as { hour: number; mean: number }[];
	// FIXME wtf
	return result.map(({ hour, mean }) => ({
		hour: new Date(Date.UTC(2022, 1, 1, hour, 0)),
		mean: mean,
	}))
}

/**
 * Get the average production in Wh for each hour of the day on the given time period.
 * @param t1 start of the time period (Unix epoch millis)
 * @param t2 end of the time period (Unix epoch millis)
 * @param profiles list of profiles to consider. If nullish or empty, all profile are considered
 * @param zoneName the urban zone to consider. If nullish the whole district is considered
 */
export async function getHourlyMeanProduction(t1: number, t2: number, profiles?: ProducerProfile[], zoneName?: string): Promise<{ hour: Date; mean: number }[]> {
	const result = await apiCall('production/hourly-mean', t1, t2, profiles, zoneName) as { hour: number; mean: number }[];
	// FIXME wtf
	return result.map(({ hour, mean }) => ({
		hour: new Date(Date.UTC(2022, 1, 1, hour, 0)),
		mean: mean,
	}))
}

export async function getMaxTimestamp(dataType: DataType): Promise<Date> {
	const entity = dataType === DataType.CONSUMPTION ? 'consumption' : 'production';
	const result = await apiCall(`${entity}/max-timestamp`) as { maxtimestamp: Date };
	console.log(result);
	return result.maxtimestamp;
}

async function apiCall(endpoint: string, t1?: number, t2?: number, profiles?: string[], zoneName?: string): Promise<any> {
	const host = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pfa.c-saccoccio.fr';
	let url = `${host}/api/v1/${endpoint}?minDate=${t1}&maxDate=${t2}`;

	if (profiles && profiles.length > 0 && profiles[0] !== ConsumerProfile.ALL) { // Use the fact that default is ALL
		url += profiles.map((p, i) => `&profiles[${i}]=${p}`).join();
	}

	if (zoneName) {
		url += `&zone=${zoneName}`;
	}

	try {
		const response = await fetch(url);
		return await response.json()
	} catch (err) {
		console.error((err as Error).message);
		return null;
	}
}
