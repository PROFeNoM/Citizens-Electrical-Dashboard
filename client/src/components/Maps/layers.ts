import { FillExtrusionLayer, FillLayer, LineLayer, CircleLayer } from 'react-map-gl';
import { Expression, StyleFunction } from 'mapbox-gl';

export type FillColor = string | StyleFunction | Expression | undefined;

export const zonesBorder: LineLayer = {
	id: 'urban-zones-border',
	type: 'line',
	source: 'urban-zones',
	paint: {
		'line-color': '#005eb8',
		'line-width': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			4,
			1,
		],
	},
}

export const zonesFill = (fillColor: FillColor) => ({
	id: 'urban-zones-data',
	type: 'fill',
	source: 'urban-zones',
	paint: {
		'fill-color': fillColor,
		'fill-opacity': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			1,
			0.8,
		],
	},
}) as FillLayer;

export const consumptionBorder: LineLayer = {
	id: 'consumption-border',
	type: 'line',
	source: 'consumption',
	paint: {
		'line-color': '#005eb8',
		'line-width': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			4,
			1,
		],
	},
}

export const consumptionFill = (fillColor: FillColor) => ({
	id: 'consumption-data',
	type: 'fill',
	source: 'consumption',
	paint: {
		'fill-color': fillColor,
		'fill-opacity': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			1,
			0.8,
		],
	},
}) as FillLayer;

export const productionBorder: LineLayer = {
	id: 'production-border',
	type: 'line',
	source: 'production',
	paint: {
		'line-color': '#005eb8',
		'line-width': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			4,
			1,
		],
	},
}

export const productionFill = (fillColor: FillColor) => ({
	id: 'production-data',
	type: 'fill',
	source: 'production',
	paint: {
		'fill-color': fillColor,
		'fill-opacity': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			1,
			0.8,
		],
	},
}) as FillLayer;

export const lightingPoints: CircleLayer = {
	'id': 'lighting-points',
	'type': 'circle',
	'source': 'Lighting-source',
	'paint': {
		'circle-radius': 12,
		'circle-color': '#e06666',
	},
	'layout': {
		'visibility': 'none'
	}
}

export const bornesPoints: CircleLayer = {
	'id': 'charging-stations-points',
	'type': 'circle',
	'source': 'charging-stations',
	'paint': {
		'circle-radius': 12,
		'circle-color': '#e06666',
	},
	'layout': {
		'visibility': 'none'
	}
}

export const allBuildings3D: FillExtrusionLayer = {
	'id': '3d-buildings',
	'source': 'district-buildings',
	'type': 'fill-extrusion',
	'minzoom': 13.5,
	'paint': {
		'fill-extrusion-color': '#aaa',
		'fill-extrusion-height': ['*', 1.5, ['get', 'HAUTEUR']],
		'fill-extrusion-base': ['get', 'Z_MIN_SOL'],
		'fill-extrusion-opacity': 0.6,
	},
	'layout': {
		'visibility': 'visible'
	}
}

export const residentialBuildings3D: FillExtrusionLayer = {
	'id': '3d-residentialbuildings',
	'source': 'district-buildings',
	'type': 'fill-extrusion',
	'filter': ['any',
		['==', 'USAGE1', 'Résidentiel'],
		['==', 'USAGE2', 'Résidentiel']
	],
	'minzoom': 13.5,
	'paint': {
		'fill-extrusion-color': '#e06666',
		'fill-extrusion-height': ['*', 1.5, ['get', 'HAUTEUR']],
		'fill-extrusion-base': ['get', 'Z_MIN_SOL'],
		'fill-extrusion-opacity': 0.6,
	},
	'layout': {
		'visibility': 'none'
	}
}
