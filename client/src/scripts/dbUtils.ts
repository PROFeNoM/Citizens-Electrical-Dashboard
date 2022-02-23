import * as turf from '@turf/turf';

const {json_Decoupage_urbain} = require("../map/layers/Decoupage_urbain");
const {json_eclairage_public_features} = require("../map/bor_ptlum");

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
	var UrbanZones = json_Decoupage_urbain.features;
	//Reorder coordinates
	UrbanZones.map((item: UrbanZoneFeature) => {
		item.geometry.coordinates[0][0].map((item: [number, number]) => {
			var tmp = item[0];
			item[0] = item[1];
			item[1] = tmp;
		})
	})

	return UrbanZones;
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

/**
 * Return the number of buildings in an urban zone
 * @param urbanZone Urban zone to search into
 * @param buildingType Building type searched
 */
export function getUrbanZoneNumberOfBuildings(urbanZone: string, buildingType: Building): number {
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

	if (data)
		return turf.area(turf.polygon(data.geometry.coordinates[0]));
	else
		return 0;
}

/**
 * Return the number of buildings in La Bastide
 * @param buildingType
 */
export function getDistrictNumberOfBuildings(buildingType: Building): number {
	return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneNumberOfBuildings(curr.properties.libelle, buildingType), 0);
}

/**
 * Return the area of La Bastide
 */
export function getDistrictArea(): number {
	return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneArea(curr.properties.libelle), 0);
}

async function runQuery(queryLink: string) {
	//console.log("http://localhost:5000/" + queryLink);
	try {
		const response = await fetch("http://localhost:5000/" + queryLink);
		return await response.json()
	} catch (err) {
		const error = err as Error;
		console.error(error.message);
	}
}

/**
 * Return the consumption of electricity for a given urban zone in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param urbanZone Urban zone of the buildings
 * @param t2 Timestamp of the end of the time period
 */
export async function getUrbanZoneElectricityConsumption(t1: number, buildingType: Building, urbanZone: string, t2: number): Promise<number> {
	let queries: string[] = [];
	let weights: any[] = [];


	function _addQuery(t1: number, t2: number, profiles?: string[]) {
		queries.push(`consumption?minDate=${t1}&maxDate=${t2}`
			+ (profiles ? profiles.reduce((prev: string, curr: string, i: number) => prev + `&profiles[${i}]=${curr}`, "") : ""));
	}

	switch (buildingType) {
		case Building.Residential:
			_addQuery(t1, t2, ["RESIDENTIAL"]);

			weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential));
			break;
		case Building.Professional:
			_addQuery(t1, t2, ["PROFESSIONAL"]);

			weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional));
			break;
		case Building.Tertiary:
			_addQuery(t1, t2, ["TERTIARY"]);

			weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary));
			break;
		case Building.Lighting:
			_addQuery(t1, t2, ["PUBLIC_LIGHTING"]);

			weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting));
			break;
		case Building.All:
			_addQuery(t1, t2, ["RESIDENTIAL", "PROFESSIONAL", "TERTIARY", "PUBLIC_LIGHTING"]);

			weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential)
				+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional)
				+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary)
				+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting));
			break;
	}

	let resultWh: number = 0;

	for (let i: number = 0; i < queries.length; i++) {
		const rawRes = await runQuery(queries[i]);
		const res = rawRes.filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null);

		resultWh += res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length;
	}

	return resultWh;
}

export async function getDistrictElectricityConsumption(t1: number, buildingType: Building, t2: number): Promise<number> {
	const consumptions: number[] = await Promise.all(json_Decoupage_urbain.features
		.map((feature: UrbanZoneFeature) => feature.properties.libelle)
		.map(async (urbanZone: string) => {
			return await getUrbanZoneElectricityConsumption(t1, buildingType, urbanZone, t2);
		}));

	return consumptions.reduce((prev: number, curr: number) => prev + curr, 0);
}

export async function getUrbanZoneElectricityProduction(t1: number, urbanZone: string, t2: number): Promise<number> {
	const rawRes = await runQuery(`production?minDate=${t1}&maxDate=${t2}&profiles[0]=SOLAR`);
	const res = rawRes.filter((rawRecord: { mean_curve: null | number; }) => rawRecord.mean_curve != null);
	return (res.reduce((total: number, next: { mean_curve: number; }) => total + next.mean_curve, 0) / res.length) * getUrbanZoneNumberOfBuildings(urbanZone, Building.Producer);
}

export async function getDistrictElectricityProduction(t1: number, t2: number): Promise<number> {
	const consumptions: number[] = await Promise.all(json_Decoupage_urbain.features
		.map((feature: UrbanZoneFeature) => feature.properties.libelle)
		.map(async (urbanZone: string) => {
			return await getUrbanZoneElectricityProduction(t1, urbanZone, t2);
		}));

	return consumptions.reduce((prev: number, curr: number) => prev + curr, 0);
}

export async function getUrbanZoneSelfConsumptionRatio(t1: number, urbanZone: string, t2: number): Promise<number> {
	const prod = await getUrbanZoneElectricityProduction(t1, urbanZone, t2);
	const cons = await getUrbanZoneElectricityConsumption(t1, Building.All, urbanZone, t2);

	return prod / cons;
}

export async function getDistrictSelfConsumption(t1: number, t2: number): Promise<number> {
	const prod = await getDistrictElectricityProduction(t1, t2);
	const cons = await getDistrictElectricityConsumption(t1, Building.All, t2);

	return prod / cons;
}
