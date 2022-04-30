import React, { MutableRefObject } from 'react';

import { LngLatBoundsLike, LngLatLike, Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';
const defaultCenter: LngLatLike = [-0.5564, 44.8431];
const defaultBounds: LngLatBoundsLike = [[-0.5463, 44.8522], [-0.5665, 44.8382]];

export interface BaseMapProps {
	center?: LngLatLike;
	bounds?: LngLatBoundsLike;
	zoom?: number;
	pitch?: number;
}

/**
 * Base map
 * 
 * Map centered on the center of the Bastide neighborhood.
 * Fit the bounds when the window is resized.
 * Interactivity is disabled.
 */
export default class BaseMap extends React.Component<BaseMapProps, {}> {
	private mapContainerRef: MutableRefObject<HTMLDivElement> = React.createRef();
	private mapRef: MutableRefObject<Map> = React.createRef();

	get map() {
		return this.mapRef.current;
	}

	componentDidMount() {
		this.mapRef.current = new Map({
			container: this.mapContainerRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			accessToken: MAPBOX_TOKEN,
			zoom: this.props.zoom ?? 15.5,
			center: this.props.center ?? defaultCenter,
			pitch: this.props.pitch ?? 42,
			interactive: false,
		});

		this.fitBounds(false);
		// Resize map when window is resized
		this.map.on('resize', () => this.fitBounds(true));
	}

	ensureMapLoading(): Promise<void> {
		return new Promise<void>(resolve => {
			if (this.map.loaded()) {
				resolve();
			} else {
				this.map.on('load', resolve);
			}
		});
	}

	private fitBounds(animate: boolean) {
		this.map.fitBounds(this.props.bounds ?? defaultBounds, {
			center: this.props.center ?? defaultCenter,
			animate: animate,
			padding: -80,
		});
	}

	render() {
		return (
			<div className="map-container" ref={this.mapContainerRef} />
		);
	}
}
