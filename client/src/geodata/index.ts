import { FeatureCollection, MultiPolygon, Point, Feature } from 'geojson';

export const buildingsGeoJSON = require('./buildings.json') as FeatureCollection<MultiPolygon, BuildingFeatureProperties>;
export const zonesGeoJSON = require('./zones.json') as FeatureCollection<MultiPolygon, ZoneFeatureProperties>;
export const chargingStationsGeoJSON = require('./BornesVE_Bordeaux_Bastide.json') as FeatureCollection<Point, { [name: string]: any; }>

// Convert data to valid GeoJSON
const publicLightingData = require('./public-lighting.json') as PublicLightingRecord[];

export const publicLightingGeoJSON = {
	"type": "FeatureCollection",
	"name": "Public_lightings",
	"features": []
}  as FeatureCollection<Point, { [name: string]: any; }>;

publicLightingGeoJSON.features = publicLightingData.map(publicLighting => ({
	"type": "Feature",
	"geometry": publicLighting.geometry,
	"properties": {}
})) as Feature<Point, { [name: string]: any; }>[];

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
