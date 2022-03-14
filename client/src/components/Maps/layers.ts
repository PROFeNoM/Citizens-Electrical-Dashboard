import { FillExtrusionLayer, FillLayer, LineLayer } from 'react-map-gl';
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

export const buildings3D: FillExtrusionLayer = {
	'id': 'add-3d-buildings',
	'source': 'district-buildings',
	'type': 'fill-extrusion',
	'minzoom': 13.5,
	'paint': {
		'fill-extrusion-color': '#aaa',
		'fill-extrusion-height': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			0,
			15.05,
			['get', 'HAUTEUR'],
		],
		'fill-extrusion-base': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			0,
			15.05,
			['get', 'Z_MIN_SOL'],
		],
		'fill-extrusion-opacity': 0.6,
	},
}
