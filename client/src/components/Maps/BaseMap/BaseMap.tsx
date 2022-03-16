import './BaseMap.css';
import React, { MutableRefObject } from 'react';
import { Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

export default class BaseMap extends React.Component<{}, {}> {
	private mapContainerRef: MutableRefObject<HTMLDivElement> = React.createRef();
	private mapRef: MutableRefObject<Map> = React.createRef();

	async componentDidMount() {
		this.mapRef.current = new Map({
			container: this.mapContainerRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			accessToken: MAPBOX_TOKEN,
			zoom: 13.5,
			center: [-0.554897, 44.845615],
		});
	}

	render() {
		return (
			<div className="map-container" ref={this.mapContainerRef} />
		);
	}

	get map() {
		return this.mapRef.current;
	}
}
