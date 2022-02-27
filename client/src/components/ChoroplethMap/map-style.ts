import type {FillLayer, LineLayer} from "react-map-gl";

export const dataLayer: FillLayer = {
	id: 'data',
	type: 'fill',
	source: 'urbanZone-source',
	paint: {
		'fill-color': {
			property: 'choroplethValue',
			stops: [
				[0, '#7fd1ef'],
				[1, '#6ab3e1'],
				[2, '#5395d4'],
				[3, '#3779c6'],
				[4, '#005eb8'],
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