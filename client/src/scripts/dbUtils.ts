import * as turf from '@turf/turf';

const json_Decoupage_urbain = require("../map/layers/Decoupage_urbain.json");
const json_eclairage_public_features = require("../map/bor_ptlum.json");
const json_Batiment_Bordeaux_Bastide_TEC = require("../map/layers/Batiment_Bordeaux_Bastide_TEC.json");

export enum Building {
	Residential,
	Professional,
	Tertiary,
	Lighting,
	Producer,
	All,
	Residential1,
	Residential2,
	Professional1,
	Professional2,
}

export interface UrbanZoneFeature {
	type: string;
	properties: {
		gid: number;
		libelle: string;
		RES1: number;
		RES2: number;
		PRO1: number;
		PRO2: number;
		ENT: number;
		PROD_F5: number;
	};
	geometry: {
		type: string;
		coordinates: [number, number][][][];
	}
}

interface LightingFeature {
	dataset: string;
	recordid: string;
	fields: {
		x_long: string;
		rowkey: string;
		geometrie: [number, number];
		partitionKey: string;
		timestamp: string;
		y_lat: string;
		code_pl: string;
		entityid: string;
		categorie: string;
		domaine: string;
	};
	geometry: {
		type: string;
		coordinates: [number, number];
	};
	record_timestamp: string;
}

/**
 * Return the features section of an urban zone
 * @param urbanZone Urban Zone for which the feature section shall be returned
 * @param json JSON to search from
 */
function getUrbanZoneFeatures(urbanZone: string, json: { features: [] }): UrbanZoneFeature {
	return json.features.filter((data: UrbanZoneFeature) => data.properties.libelle === urbanZone)[0];
}


/**
 * Returns all urban zone features in La Bastide
 *
 */
export function getAllUrbanZone(): Array<UrbanZoneFeature> {
	const UrbanZones = json_Decoupage_urbain.features;
	//Reorder coordinates
	UrbanZones.forEach((item: UrbanZoneFeature) => {
		item.geometry.coordinates[0][0].forEach((item: [number, number]) => {
			const tmp = item[0];
			item[0] = item[1];
			item[1] = tmp;
		})
	})

	return UrbanZones;
}

export function getAllUrbanZonesName(): string[] {
	return json_Decoupage_urbain.features.map(zone => zone.properties.libelle);
}

/**
 * Returns the coordinates of each vertex bounding an urban area
 * @param zone Zone for which we want the coordinates
 */
export function getUrbanZoneCoordinates(zone: UrbanZoneFeature): [number, number][] {
	return zone.geometry.coordinates[0][0];
}


export function getUrbanZoneLibelle(zone: UrbanZoneFeature): string {
	return zone.properties.libelle;
}

let urbanZoneNumberOfBuildings: { [urbanZone: string]: number } = {};

/**
 * Return the number of buildings in an urban zone
 * @param urbanZone Urban zone to search into
 */
export function getUrbanZoneNumberOfBuildings(urbanZone: string): number {
	if (urbanZoneNumberOfBuildings[urbanZone])
		return urbanZoneNumberOfBuildings[urbanZone];

	const searchWithin = turf.polygon(getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain).geometry.coordinates[0]);
	const buildings = json_Batiment_Bordeaux_Bastide_TEC
		.features
		.map((f: { geometry: { coordinates: turf.helpers.Position[][][]; }; }) => turf.booleanContains(searchWithin, turf.polygon(f.geometry.coordinates[0])))
		.filter(Boolean)
		.length;

	urbanZoneNumberOfBuildings[urbanZone] = buildings;
	return buildings;
}

/**
 * Return the number of buildings in La Bastide
 */
export function getDistrictNumberOfBuildings(): number {
	return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneNumberOfBuildings(curr.properties.libelle), 0);
}

/**
 * Return the number of sites in an urban zone
 * @param urbanZone Urban zone to search into
 * @param buildingType Building type searched
 */
export function getUrbanZoneNumberOfSites(urbanZone: string, buildingType: Building): number {
	const data: UrbanZoneFeature = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);

	if (data) {
		const dataProperties: UrbanZoneFeature["properties"] = data.properties;
		switch (buildingType) {
			case Building.Residential:
				return dataProperties.RES1 + dataProperties.RES2;
			case Building.Residential1:
				return dataProperties.RES1;
			case Building.Residential2:
				return dataProperties.RES2;
			case Building.Professional:
				return dataProperties.PRO1 + dataProperties.PRO2;
			case Building.Professional1:
				return dataProperties.PRO1;
			case Building.Professional2:
				return dataProperties.PRO2;
			case Building.Tertiary:
				return dataProperties.ENT;
			case Building.Lighting:
				const searchWithin = turf.polygon(data.geometry.coordinates[0]);
				const ptsWithin: LightingFeature[] = json_eclairage_public_features.filter((feature: LightingFeature) => turf.booleanWithin(turf.point(feature.geometry.coordinates), searchWithin));
				return ptsWithin.length;
			case Building.Producer:
				return dataProperties.PROD_F5;
		}
	}

	return 0;
}

/**
 * Return the area in square meters of the urban zone
 * @param urbanZone Urban zone for which the area should be computed
 */
export function getUrbanZoneArea(urbanZone: string): number {
	const data: UrbanZoneFeature = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);

	return data ? turf.area(turf.polygon(data.geometry.coordinates[0])) : 0;
}

/**
 * Return the number of sites in La Bastide
 * @param buildingType
 */
export function getDistrictNumberOfSites(buildingType: Building): number {
	return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneNumberOfSites(curr.properties.libelle, buildingType), 0);
}

/**
 * Return the area of La Bastide
 */
export function getDistrictArea(): number {
	return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneArea(curr.properties.libelle), 0);
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

	const getFn = zoneName === 'La Bastide' ? getDistrictNumberOfSites : (bType: Building) => getUrbanZoneNumberOfSites(zoneName, bType);

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
	const getFn = zoneName === 'La Bastide' ? () => getDistrictNumberOfSites(Building.Producer) : () => getUrbanZoneNumberOfSites(zoneName, Building.Producer);
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