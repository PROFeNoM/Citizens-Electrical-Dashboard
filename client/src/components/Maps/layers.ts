import { FillExtrusionLayer, FillLayer, LineLayer, CircleLayer } from 'react-map-gl';
import { Expression, StyleFunction } from 'mapbox-gl';

export type FillColor = string | StyleFunction | Expression | undefined;

export const zonesBorder: LineLayer = {
	id: 'outline',
	type: 'line',
	source: 'urbanZone-source',
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
	id: 'data',
	type: 'fill',
	source: 'urbanZone-source',
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
}

export const bornesPoints: CircleLayer = {
	'id': 'bornes-points',
	'type': 'circle',
	'source': 'Bornes-source',
	'paint': {
		'circle-radius': 12,
		'circle-color': '#e06666',
	},
}

export const allBuildings3D: FillExtrusionLayer = {
	'id': 'add-3d-buildings',
	'source': 'district-buildings',
	'type': 'fill-extrusion',
	'minzoom': 13.5,
	'paint': {
		'fill-extrusion-color': '#aaa',
		'fill-extrusion-height': ["*", 1.5, ['get', 'HAUTEUR']],
		'fill-extrusion-base': ['get', 'Z_MIN_SOL'],
		'fill-extrusion-opacity': 0.6,
	},
}

export const residentialBuildings3D: FillExtrusionLayer = {
	'id': 'add-3d-buildings',
	'source': 'district-buildings',
	'type': 'fill-extrusion',
	'filter': ['==', 'USAGE1', 'Résidentiel'],
	'minzoom': 13.5,
	'paint': {
		'fill-extrusion-color': '#e06666',
		'fill-extrusion-height': ["*", 1.5, ['get', 'HAUTEUR']],
		'fill-extrusion-base': ['get', 'Z_MIN_SOL'],
		'fill-extrusion-opacity': 0.6,
	},
}
