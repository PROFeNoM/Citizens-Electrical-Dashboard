import './BaseMap.css';
import React, { MutableRefObject } from 'react';
import { Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

interface State {
	lng: number,
	lat: number,
	zoom: number,
}

export default class BaseMap extends React.Component<{}, State> {
	private mapContainerRef: MutableRefObject<HTMLDivElement> = React.createRef();
	private mapRef: MutableRefObject<Map> = React.createRef<Map>();

	constructor(props) {
		super(props);
		this.state = {
			lng: -0.554897,
			lat: 44.845615,
			zoom: 13.5,
		};
	}

	async componentDidMount() {
		this.mapRef.current = new Map({
			container: this.mapContainerRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			accessToken: MAPBOX_TOKEN,
			zoom: this.state.zoom,
			center: [
				this.state.lng,
				this.state.lat,
			],
		});
	}

	render() {
		if (this.mapRef.current?.loaded()) {
			this.mapRef.current
				.setZoom(this.state.zoom)
				.setCenter([
					this.state.lng,
					this.state.lat,
				]);
		}

		return (
			<div className="map-container" ref={this.mapContainerRef} />
		);
	}

	get map() {
		return this.mapRef.current;
	}
}
