import * as turf from '@turf/turf';
import { buildings, zones, publicLighting, ZoneFeatureProperties } from '../geodata';
import { Feature, MultiPolygon } from 'geojson';

export enum Profile {
	RESIDENTIAL = 'RESIDENTIAL',
	PROFESSIONAL = 'PROFESSIONAL',
	TERTIARY = 'TERTIARY',
	PUBLIC_LIGHTING = 'PUBLIC_LIGHTING',
	ALL = 'ALL',
}

/** Exactly like booleanContains of @turf/turf, but it works with MultiPolygon. */
function isContained(feature1: Feature<MultiPolygon, any>, feature2: Feature<MultiPolygon, any>) {
	// each "for" will loop only once if the given features are made of only one polygon each (which is most likely the case)
	for (const polygon1 of feature1.geometry.coordinates) {
		for (const polygon2 of feature2.geometry.coordinates) {
			if (turf.booleanContains(
				{ type: 'Polygon', coordinates: polygon1 },
				{ type: 'Polygon', coordinates: polygon1 },
			)) {
				return true;
			}
		}
	}
	return false;
}

const zonesNbOfBuildings: Record<string, number> = {};
for (const zone of zones.features) {
	zonesNbOfBuildings[zone.properties.libelle] = buildings.features.filter(building => isContained(zone, building)).length;
}

const zonesArea: Record<string, number> = {};
for (const zone of zones.features) {
	zonesArea[zone.properties.libelle] = turf.area(zone);
}

/**
 * Return the features section of an urban zone
 * @param zoneName Urban Zone for which the feature section shall be returned
 */
function getZone(zoneName: string): Feature<MultiPolygon, ZoneFeatureProperties> {
	return zones.features.filter(data => data.properties.libelle === zoneName)[0];
}

export function getZonesName(): string[] {
	return zones.features.map(zone => zone.properties.libelle);
}

/**
 * Return the number of buildings in an urban zone
 * @param zoneName Urban zone to search into
 */
export function getZoneNbOfBuildings(zoneName: string): number {
	return zonesNbOfBuildings[zoneName];
}

/**
 * Return the number of sites in an urban zone
 * @param zoneName Urban zone to search into
 * @param buildingType Building type searched
 */
export function getZoneNbOfCollectionSites(zoneName: string, buildingType: Profile): number {
	const zone = getZone(zoneName);
	const zoneProperties = zone.properties;

	switch (buildingType) {
		case Profile.RESIDENTIAL:
			return zoneProperties.RES1 + zoneProperties.RES2;
		case Profile.PROFESSIONAL:
			return zoneProperties.PRO1 + zoneProperties.PRO2;
		case Profile.TERTIARY:
			return zoneProperties.ENT;
		case Profile.PUBLIC_LIGHTING:
			return publicLighting.filter(pl => turf.booleanWithin(turf.point(pl.geometry.coordinates), zone)).length;
		case Profile.ALL:
			return getZoneNbOfCollectionSites(zoneName, Profile.RESIDENTIAL)
				+ getZoneNbOfCollectionSites(zoneName, Profile.PROFESSIONAL)
				+ getZoneNbOfCollectionSites(zoneName, Profile.TERTIARY)
				+ getZoneNbOfCollectionSites(zoneName, Profile.PUBLIC_LIGHTING)
	}
}

/**
 * Return the area in square meters of the urban zone
 * @param zoneName Urban zone for which the area should be computed
 */
export function getUrbanZoneArea(zoneName: string): number {
	return zonesArea[zoneName];
}

/**
 * Return the number of sites in La Bastide
 * @param buildingType
 */
export function getDistrictNbOfCollectionSites(buildingType: Profile): number {
	return getZonesName().map(name => getZoneNbOfCollectionSites(name, buildingType)).reduce((a, b) => a + b);
}

async function runQuery(queryLink: string) {
	const host = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pfa.c-saccoccio.fr';
	try {
		const response = await fetch(`${host}/api/v1/${queryLink}`);
		return await response.json()
	} catch (err) {
		const error = err as Error;
		console.error(error.message);
	}
}

/**
 * Return the consumption of electricity for a given urban zone in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param profile Building type to get the consumption from
 * @param zoneName Urban zone of the buildings
 * @param t2 Timestamp of the end of the time period
 */
export async function getZoneConsumption(t1: number, profile: Profile, zoneName: string, t2: number): Promise<number> {
	let queryResults: [Promise<any>, number][] = [];

	const getFn = zoneName === 'La Bastide' ? getDistrictNbOfCollectionSites : (bType: Profile) => getZoneNbOfCollectionSites(zoneName, bType);

	async function _addQuery(t1: number, t2: number, profiles: string[], nbBuilding: number) {
		const record = {
			timestamps: [t1, t2],
			profiles: profiles,
			result: runQuery(`consumption?minDate=${t1}&maxDate=${t2}`
				+ profiles.reduce((prev: string, curr: string, i: number) => prev + `&profiles[${i}]=${curr}`, ""))
		};
		queryResults.push([record.result, nbBuilding])
	}

	switch (profile) {
		case Profile.RESIDENTIAL:
			await _addQuery(t1, t2, ["RESIDENTIAL"], getFn(Profile.RESIDENTIAL));
			break;
		case Profile.PROFESSIONAL:
			await _addQuery(t1, t2, ["PROFESSIONAL"], getFn(Profile.PROFESSIONAL));
			break;
		case Profile.TERTIARY:
			await _addQuery(t1, t2, ["TERTIARY"], getFn(Profile.TERTIARY));
			break;
		case Profile.PUBLIC_LIGHTING:
			await _addQuery(t1, t2, ["PUBLIC_LIGHTING"], getFn(Profile.PUBLIC_LIGHTING));
			break;
		case Profile.ALL:
			await _addQuery(t1, t2, ["RESIDENTIAL", "PROFESSIONAL", "TERTIARY", "PUBLIC_LIGHTING"],
				getFn(Profile.RESIDENTIAL)
				+ getFn(Profile.PROFESSIONAL)
				+ getFn(Profile.TERTIARY)
				+ getFn(Profile.PUBLIC_LIGHTING));
			break;
	}
	const buildings = {
		"RESIDENTIAL": getFn(Profile.RESIDENTIAL),
		"PROFESSIONAL": getFn(Profile.PROFESSIONAL),
		"TERTIARY": getFn(Profile.TERTIARY),
		"PUBLIC_LIGHTING": getFn(Profile.PUBLIC_LIGHTING)
	}

	let resultWh: number = 0;
	for (let i: number = 0; i < queryResults.length; i++) {
		const res = (await queryResults[i][0]).filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null);
		// @ts-ignore
		resultWh += res.reduce((total: number, next: { mean_curve: number; profile: string; }) => total + (next.mean_curve / 2) * buildings[next.profile], 0)
		//resultWh += res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length * queryResults[i][1];
	}

	return resultWh;
}

/**
 * Return the consumption of electricity for La Bastide in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param t2 Timestamp of the end of the time period
 */
export async function getDistrictElectricityConsumption(t1: number, buildingType: Profile, t2: number): Promise<number> {
	// @ts-ignore
	return await getZoneElectricityConsumption(t1, buildingType, 'La Bastide', t2);
}

async function getZoneProduction(t1: number, zoneName: string, t2: number): Promise<number | any[]> {
	/*const getFn = zoneName === 'La Bastide' ? () => getDistrictNbOfCollectionSites(Building.Producer) : () => getZoneNbOfCollectionSites(zoneName, Building.Producer);
	let rawRes = await runQuery(`production?minDate=${t1}&maxDate=${t2}&profiles[0]=SOLAR`);
	const res = (await rawRes).filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null);
	const nbBuildings = getFn();*/

	return 42;

	//return (res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length) * getFn();
	// return res.reduce((total: number, next: { mean_curve: number; }) => total + (next.mean_curve / 2) * nbBuildings, 0)
	//return (res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length) * getFn();
}

export async function getUrbanZoneElectricityProduction(t1: number, urbanZone: string, t2: number): Promise<number> {
	// @ts-ignore
	return getZoneProduction(t1, urbanZone, t2);
}

export async function getDistrictElectricityProduction(t1: number, t2: number): Promise<number> {
	// @ts-ignore
	return getZoneProduction(t1, 'La Bastide', t2);
}

async function getMeanZone(t1: number, buildingType: Profile, urbanZone: string, t2: number, getZoneData: (t1, buildingType, urbanZone, t2) => Promise<any[]>) {
	const hours = Array
		.from(Array(24).keys())
		.map(h => new Date(Date.UTC(2022, 1, 1, h, 0)));
	const rawRecords = await getZoneData(t1, buildingType, urbanZone, t2);

	const hoursClassification = hours.map(h => {
		return {
			hour: h,
			records: []
		}
	});

	rawRecords.forEach(record => {
		const recordHourIdx = new Date(record.timestamp).getHours();
		hoursClassification[recordHourIdx].records.push(record.mean_curve);
	});

	return hoursClassification.map(value => {
		return {
			hour: value.hour,
			mean: value.records.reduce((a, b) => a + b, 0) / value.records.length || 0
		}
	});
}

export async function getMeanUrbanZoneElectricityConsumption(t1: number, buildingType: Profile, urbanZone: string, t2: number): Promise<{ hour: Date; mean: number }[]> {
	// FIXME
	return (new Array(24)).map((_, i) => ({ hour: new Date(Date.UTC(2022, 1, 1, i, 0)), mean: NaN }));
	//return getMeanZone(t1, buildingType, urbanZone, t2, (t1, buildingType, urbanZone, t2) => getZoneConsumption(t1, buildingType, urbanZone, t2) as Promise<any[]>);
}

export async function getMeanUrbanZoneElectricityProduction(t1: number, urbanZone: string, t2: number): Promise<{ hour: Date; mean: number }[]> {
	// FIXME
	return (new Array(24)).map((_, i) => ({ hour: new Date(Date.UTC(2022, 1, 1, i, 0)), mean: NaN }));
	//return getMeanZone(t1, null, urbanZone, t2, (t1, buildingType, urbanZone, t2) => getZoneProduction(t1, urbanZone, t2, true) as Promise<any[]>);
}
