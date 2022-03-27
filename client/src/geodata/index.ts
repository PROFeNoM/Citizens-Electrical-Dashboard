import { FeatureCollection, MultiPolygon } from 'geojson';

export const buildings = require('./buildings.json') as FeatureCollection<MultiPolygon, BuildingFeatureProperties>;
export const zones = require('./zones.json') as FeatureCollection<MultiPolygon, ZoneFeatureProperties>;
export const publicLighting = require('./public-lighting.json') as PublicLightingRecord[];

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
