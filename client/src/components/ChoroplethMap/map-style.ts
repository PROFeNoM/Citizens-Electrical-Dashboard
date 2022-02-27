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
				[1, '#76cbed'],
				[2, '#6cc5eb'],
				[3, '#62bfe9'],
				[4, '#56bae8'],
				[5, '#4ab4e6'],
				[6, '#3baee4'],
				[7, '#28a9e2'],
				[8, '#00a3e0']
			]
		},
		'fill-opacity': [
			"case",
			["boolean", ["feature-state", "hover"], false],
			1,
			0.6,
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