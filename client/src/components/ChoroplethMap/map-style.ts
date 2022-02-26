import type {FillLayer} from "react-map-gl";

export const dataLayer: FillLayer = {
	id: 'data',
	type: 'fill',
	paint: {
		'fill-color': {
			property: 'choroplethValue',
			stops: [
				[0, '#bfd7ed'],
				[1, '#aec7e7'],
				[2, '#9db7e0'],
				[3, '#8ba7da'],
				[4, '#7998d3'],
				[5, '#6589cc'],
				[6, '#507ac6'],
				[7, '#356cbf'],
				[8, '#005eb8']
			]
		},
		'fill-opacity': 0.8,
	}
};