import { FeatureCollection, MultiPolygon, Point, Feature } from '@turf/turf';

import { getApiRoot } from '../scripts/api';

export interface BuildingFeatureProperties {
	osm_id: null,
	name: null,
	type: null,
	ID_numero_batiment: null,
	ID: string,
	NATURE: string,
	USAGE1: string,
	USAGE2: string,
	LEGER: string,
	ETAT: string,
	DATE_CREAT: string,
	DATE_MAJ: string,
	DATE_APP: string,
	DATE_CONF: string,
	SOURCE: string,
	ID_SOURCE: string,
	PREC_PLANI: number,
	PREC_ALTI: number,
	NB_LOGTS: number,
	NB_ETAGES: number,
	MAT_MURS: string,
	MAT_TOITS: string,
	HAUTEUR: number,
	Z_MIN_SOL: number,
	Z_MIN_TOIT: number,
	Z_MAX_TOIT: number,
	Z_MAX_SOL: number,
	ORIGIN_BAT: string,
	APP_FF: string
}

export interface ZoneFeatureProperties {
	gid: number,
	libelle: string,
	RES1: number,
	RES2: number,
	PRO1: number,
	PRO2: number,
	ENT: number,
	PROD_F5: number,
}

export interface PublicLightingRecord {
	datasetid: string,
	recordid: string,
	fields: {
		x_long: string,
		rowkey: string,
		geometrie: [number, number],
		partitionKey: string,
		timestamp: string,
		y_lat: string,
		code_pl: string,
		entityid: string,
		categorie: string,
		domaine: string,
	};
	geometry: {
		type: string,
		coordinates: [number, number],
	};
	record_timestamp: string,
}

let buildingsGeoJSON: Promise<FeatureCollection<MultiPolygon, BuildingFeatureProperties>> | null = null;
export async function getBuildingsGeoJSON() {
	if (buildingsGeoJSON === null) {
		buildingsGeoJSON = fetchGeoJSON('buildings');
	}
	return await buildingsGeoJSON;
}

let zonesGeoJSON: Promise<FeatureCollection<MultiPolygon, ZoneFeatureProperties>> | null = null;
export async function getZonesGeoJSON() {
	if (zonesGeoJSON === null) {
		zonesGeoJSON = fetchGeoJSON('zones');
	}
	return await zonesGeoJSON;
}

let chargingStationsGeoJSON: Promise<FeatureCollection<Point, { [name: string]: any }>> | null = null;
export async function getChargingStationsGeoJSON() {
	if (chargingStationsGeoJSON === null) {
		chargingStationsGeoJSON = fetchGeoJSON('charging-stations');
	}
	return await chargingStationsGeoJSON;
}

let publicLightingGeoJSON: Promise<FeatureCollection<Point, { [name: string]: any }>> | null = null;
export async function getPublicLightingGeoJSON() {
	if (publicLightingGeoJSON === null) {
		publicLightingGeoJSON = new Promise(resolve => {
			fetchGeoJSON('public-lighting').then(data => {
				const result = {
					"type": "FeatureCollection",
					"name": "Public_lightings",
					"features": []
				}  as FeatureCollection<Point, { [name: string]: any }>;
				result.features = data.map(publicLighting => ({
					"type": "Feature",
					"geometry": publicLighting.geometry,
					"properties": {}
				})) as Feature<Point, { [name: string]: any }>[];
				resolve(result);
			})
		})
	}
	return await publicLightingGeoJSON;
}

async function fetchGeoJSON(name: string) {
	const res = await fetch(`${getApiRoot()}/geodata/${name}.json`);
	return await res.json();
}
