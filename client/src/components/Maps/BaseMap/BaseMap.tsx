import './BaseMap.css';
import React, { MutableRefObject } from 'react';
import { LngLatBoundsLike, LngLatLike, Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';
const defaultCenter: LngLatLike = [-0.5562, 44.8449];

export interface BaseMapProps {
	center?: LngLatLike,
	/** defines the zone to be displayed (setting this will disable interactivity) */
	bounds?: LngLatBoundsLike,
	zoom?: number,
	pitch?: number,
}

export default class BaseMap extends React.Component<BaseMapProps, {}> {
	private mapContainerRef: MutableRefObject<HTMLDivElement> = React.createRef();
	private mapRef: MutableRefObject<Map> = React.createRef();

	componentDidMount() {
		this.mapRef.current = new Map({
			container: this.mapContainerRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			accessToken: MAPBOX_TOKEN,
			zoom: this.props.zoom ?? 13.5,
			center: this.props.center ?? defaultCenter,
			pitch: this.props.pitch ?? 0,
			interactive: !this.props.bounds,
		});

		if (this.props.bounds) {
			this.fitBounds(false);
			this.map.on('resize', () => this.fitBounds(true));
		}
	}

	ensureMapLoading(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.map.loaded()) {
				resolve();
			} else {
				this.map.on('load', resolve);
			}
		})
	}

	render() {
		return (
			<div className="map-container" ref={this.mapContainerRef} />
		);
	}

	get map() {
		return this.mapRef.current;
	}

	private fitBounds(animate: boolean) {
		this.map.fitBounds(this.props.bounds, {
			center: this.props.center ?? defaultCenter,
			animate: animate,
			padding: -80,
		})
	}
}
