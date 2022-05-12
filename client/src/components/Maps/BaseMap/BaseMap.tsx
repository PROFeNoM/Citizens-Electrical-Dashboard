import './BaseMap.css';

import React, { MutableRefObject } from 'react';

import { LngLatBoundsLike, LngLatLike, Map } from 'mapbox-gl';

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

export interface BaseMapProps {
	center?: LngLatLike;
	bounds?: LngLatBoundsLike;
	zoom?: number;
	pitch?: number;
}

const defaultProps: BaseMapProps = {
	center: [-0.5566, 44.8431],
	bounds: [[-0.5463, 44.8522], [-0.5665, 44.8382]],
	zoom: 15.5,
	pitch: 42,
};

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
			zoom: this.props.zoom ?? defaultProps.zoom,
			center: this.props.center ?? defaultProps.center,
			pitch: this.props.pitch ?? defaultProps.pitch,
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
		this.map.fitBounds(this.props.bounds ?? defaultProps.bounds, {
			center: this.props.center ?? defaultProps.center,
			animate: animate,
			padding: -50,
		});
	}

	render() {
		return (
			<div id="base-map" ref={this.mapContainerRef} />
		);
	}
}
