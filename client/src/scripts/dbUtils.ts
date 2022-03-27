import * as turf from '@turf/turf';
import { buildings, zones, publicLighting, ZoneFeatureProperties } from '../geodata';
import { Feature, MultiPolygon } from 'geojson';

export enum Building {
	Residential,
	Professional,
	Tertiary,
	Lighting,
	Producer,
	All,
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
export function getZoneNbOfCollectionSites(zoneName: string, buildingType: Building): number {
	const zone = getZone(zoneName);
	const zoneProperties = zone.properties;

	switch (buildingType) {
		case Building.Residential:
			return zoneProperties.RES1 + zoneProperties.RES2;
		case Building.Professional:
			return zoneProperties.PRO1 + zoneProperties.PRO2;
		case Building.Tertiary:
			return zoneProperties.ENT;
		case Building.Lighting:
			return publicLighting.filter(pl => turf.booleanWithin(turf.point(pl.geometry.coordinates), zone)).length;
		case Building.Producer:
			return zoneProperties.PROD_F5;
		case Building.All:
			return getZoneNbOfCollectionSites(zoneName, Building.Residential)
				+ getZoneNbOfCollectionSites(zoneName, Building.Professional)
				+ getZoneNbOfCollectionSites(zoneName, Building.Tertiary)
				+ getZoneNbOfCollectionSites(zoneName, Building.Lighting)
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
export function getDistrictNbOfCollectionSites(buildingType: Building): number {
	return getZonesName().map(name => getZoneNbOfCollectionSites(name, buildingType)).reduce((a, b) => a + b);
}

async function runQuery(queryLink: string) {
	const host = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pfa.c-saccoccio.fr';
	try {
		const response = await fetch(`${host}/${queryLink}`);
		return await response.json()
	} catch (err) {
		const error = err as Error;
		console.error(error.message);
	}
}

interface QueryResults {
	timestamps: [number, number];
	profiles: string[];
	result: Promise<any>;
}

interface QueriedData {
	timestamps: [number, number];
	profiles: string[];
}

let computedResults: QueryResults[] = [];
let queried: QueriedData[] = [];

async function getZoneElectricityConsumption(t1: number, buildingType: Building, zoneName: string, t2: number, returnRaw=false): Promise<number | any[]> {
	let queryResults: [Promise<any>, number][] = [];

	const getFn = zoneName === 'La Bastide' ? getDistrictNbOfCollectionSites : (bType: Building) => getZoneNbOfCollectionSites(zoneName, bType);

	async function _addQuery(t1: number, t2: number, profiles: string[], nbBuilding: number) {
		const timestamps = [t1, t2];
		if (queried.filter(value => value.timestamps.every((v, i) => v === timestamps[i]) && value.profiles.every((v, i) => v === profiles[i])).length !== 0) {
			const result: QueryResults[] = computedResults.filter(value => value.timestamps.every((v, i) => v === timestamps[i]) && value.profiles.every((v, i) => v === profiles[i]));
			queryResults.push([result[0].result, nbBuilding]);
		} else {
			queried.push({
				timestamps: [t1, t2],
				profiles: profiles
			});
			const record: QueryResults = {
				timestamps: [t1, t2],
				profiles: profiles,
				result: runQuery(`consumption?minDate=${t1}&maxDate=${t2}`
					+ profiles.reduce((prev: string, curr: string, i: number) => prev + `&profiles[${i}]=${curr}`, ""))
			};
			computedResults.push(record);
			queryResults.push([record.result, nbBuilding])
		}
	}

	switch (buildingType) {
		case Building.Residential:
			await _addQuery(t1, t2, ["RESIDENTIAL"], getFn(Building.Residential));
			break;
		case Building.Professional:
			await _addQuery(t1, t2, ["PROFESSIONAL"], getFn(Building.Professional));
			break;
		case Building.Tertiary:
			await _addQuery(t1, t2, ["TERTIARY"], getFn(Building.Tertiary));
			break;
		case Building.Lighting:
			await _addQuery(t1, t2, ["PUBLIC_LIGHTING"], getFn(Building.Lighting));
			break;
		case Building.All:
			await _addQuery(t1, t2, ["RESIDENTIAL", "PROFESSIONAL", "TERTIARY", "PUBLIC_LIGHTING"],
				getFn(Building.Residential)
				+ getFn(Building.Professional)
				+ getFn(Building.Tertiary)
				+ getFn(Building.Lighting));
			break;
	}
	const buildings = {
		"RESIDENTIAL": getFn(Building.Residential),
		"PROFESSIONAL": getFn(Building.Professional),
		"TERTIARY": getFn(Building.Tertiary),
		"PUBLIC_LIGHTING": getFn(Building.Lighting)
	}

	if (returnRaw) {
		let rawRecords: any[] = [];
		for (let i: number = 0; i < queryResults.length; i++) {
			(await queryResults[i][0])
				.filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null)
				.forEach(el => rawRecords.push({
					...el,
					mean_curve: el.mean_curve / 2 * buildings[el.profile]
				}));
		}
		return rawRecords;
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
 * Return the consumption of electricity for a given urban zone in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param urbanZone Urban zone of the buildings
 * @param t2 Timestamp of the end of the time period
 */
export async function getZoneConsumption(t1: number, buildingType: Building, urbanZone: string, t2: number): Promise<number> {
	// @ts-ignore
	return await getZoneElectricityConsumption(t1, buildingType, urbanZone, t2);
}

/**
 * Return the consumption of electricity for La Bastide in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param t2 Timestamp of the end of the time period
 */
export async function getDistrictElectricityConsumption(t1: number, buildingType: Building, t2: number): Promise<number> {
	// @ts-ignore
	return await getZoneElectricityConsumption(t1, buildingType, 'La Bastide', t2);
}

async function getZoneElectricityProduction(t1: number, zoneName: string, t2: number, returnRaw=false): Promise<number | any[]> {
	const getFn = zoneName === 'La Bastide' ? () => getDistrictNbOfCollectionSites(Building.Producer) : () => getZoneNbOfCollectionSites(zoneName, Building.Producer);
	let rawRes;

	const timestamps = [t1, t2];
	const profiles = ["SOLAR"];
	if (queried.filter(value => value.timestamps.every((v, i) => v === timestamps[i]) && value.profiles.every((v, i) => v === profiles[i])).length !== 0) {
		const result: QueryResults[] = computedResults.filter(value => value.timestamps.every((v, i) => v === timestamps[i]) && value.profiles.every((v, i) => v === profiles[i]));
		rawRes = result[0].result;
	} else {
		queried.push({
			timestamps: [t1, t2],
			profiles: profiles
		});
		const record: QueryResults = {
			timestamps: [t1, t2],
			profiles: profiles,
			result: runQuery(`production?minDate=${t1}&maxDate=${t2}&profiles[0]=SOLAR`)
		};
		computedResults.push(record);
		rawRes = record.result;
	}
	const res = (await rawRes).filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null);
	const nbBuildings = getFn();

	if (returnRaw) {
		return res.map(el => {
			return {
				...el,
				mean_curve: el.mean_curve / 2 * nbBuildings
			}
		});
	}
	//return (res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length) * getFn();
	return res.reduce((total: number, next: { mean_curve: number; }) => total + (next.mean_curve / 2) * nbBuildings, 0)
	//return (res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length) * getFn();
}

export async function getUrbanZoneElectricityProduction(t1: number, urbanZone: string, t2: number): Promise<number> {
	// @ts-ignore
	return getZoneElectricityProduction(t1, urbanZone, t2);
}

export async function getDistrictElectricityProduction(t1: number, t2: number): Promise<number> {
	// @ts-ignore
	return getZoneElectricityProduction(t1, 'La Bastide', t2);
}

export async function getUrbanZoneSelfConsumptionRatio(t1: number, urbanZone: string, t2: number): Promise<number> {
	const prod = await getUrbanZoneElectricityProduction(t1, urbanZone, t2);
	const cons = await getZoneConsumption(t1, Building.All, urbanZone, t2);

	return prod / cons;
}

export async function getDistrictSelfConsumption(t1: number, t2: number): Promise<number> {
	const prod = await getDistrictElectricityProduction(t1, t2);
	const cons = await getDistrictElectricityConsumption(t1, Building.All, t2);

	return prod / cons;
}

async function getMeanZone(t1: number, buildingType: Building, urbanZone: string, t2: number, getZoneData: (t1, buildingType, urbanZone, t2) => Promise<any[]>) {
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

export async function getMeanUrbanZoneElectricityConsumption(t1: number, buildingType: Building, urbanZone: string, t2: number): Promise<{ hour: Date; mean: number }[]> {
	return getMeanZone(t1, buildingType, urbanZone, t2, (t1, buildingType, urbanZone, t2) => getZoneElectricityConsumption(t1, buildingType, urbanZone, t2, true) as Promise<any[]>);
}

export async function getMeanUrbanZoneElectricityProduction(t1: number, urbanZone: string, t2: number): Promise<{ hour: Date; mean: number }[]> {
	return getMeanZone(t1, null, urbanZone, t2, (t1, buildingType, urbanZone, t2) => getZoneElectricityProduction(t1, urbanZone, t2, true) as Promise<any[]>);
}
