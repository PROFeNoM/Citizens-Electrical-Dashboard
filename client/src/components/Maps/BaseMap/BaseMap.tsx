import './BaseMap.css';
import React, { MutableRefObject } from 'react';
import { Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

interface Props {
	lng?: number,
	lat?: number,
	zoom?: number,
	pitch?: number,
	interactive?: boolean,
}

export default class BaseMap extends React.Component<Props, {}> {
	private mapContainerRef: MutableRefObject<HTMLDivElement> = React.createRef();
	private mapRef: MutableRefObject<Map> = React.createRef();

	async componentDidMount() {
		this.mapRef.current = new Map({
			container: this.mapContainerRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			accessToken: MAPBOX_TOKEN,
			zoom: this.props.zoom ?? 13.5,
			center: [
				this.props.lng ?? -0.5562,
				this.props.lat ?? 44.8449,
			],
			pitch: this.props.pitch ?? 0,
			interactive: this.props.interactive ?? true,
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
