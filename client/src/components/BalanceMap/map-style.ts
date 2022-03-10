import type {FillExtrusionLayer, FillLayer, LineLayer} from "react-map-gl";

export const dataLayer: FillLayer = {
	id: 'data',
	type: 'fill',
	source: 'urbanZone-source',
	paint: {
		'fill-color': {
			property: 'curentZone',
			stops: [
				[0, '#7fd1ef'],
				[1, '#005eb8'],
			]
		},
		'fill-opacity': [
			"case",
			["boolean", ["feature-state", "hover"], false],
			1,
			0.8,
		],
	}
};

export const polyStyle: LineLayer = {
	id: 'outline',
	type: 'line',
	source: 'urbanZone-source',
	paint: {
		'line-color': '#005eb8',
		'line-width': [
			'case',
			['boolean', ['feature-state', 'hover'], false],
			4,
			1
		]
	}
}

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
			['get', 'HAUTEUR']
		],
		'fill-extrusion-base': [
			'interpolate',
			['linear'],
			['zoom'],
			15,
			0,
			15.05,
			['get', 'Z_MIN_SOL']
		],
		'fill-extrusion-opacity': 0.6
	}
}