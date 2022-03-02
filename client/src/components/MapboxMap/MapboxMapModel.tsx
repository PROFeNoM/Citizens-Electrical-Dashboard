import React from "react";
import mapboxgl from "mapbox-gl";

export interface MapState {
	mapContainer: React.RefObject<HTMLInputElement>;
	map: React.MutableRefObject<mapboxgl.Map>;
	lng: number;
	lat: number;
	zoom: number;
}

class MapModel implements MapState {
	mapContainer: React.RefObject<HTMLInputElement>;
	map: React.MutableRefObject<mapboxgl.Map>;
	lng: number;
	lat: number;
	zoom: number;

	constructor() {
		this.mapContainer = React.createRef();
		this.map = React.createRef();
		this.lng = -0.554897;
		this.lat = 44.845615;
		this.zoom = 14.5;
	}
}

export default MapModel;