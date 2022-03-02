import React from "react";
import mapboxgl, {AnyLayer, AnySourceData} from "mapbox-gl";

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

export interface MapState {
	mapContainer: React.RefObject<HTMLInputElement>;
	map: React.MutableRefObject<mapboxgl.Map>;
	lng: number;
	lat: number;
	zoom: number;
	initializeMap: () => void;
	addSources: (ids: string[], sources: AnySourceData[]) => void;
	addLayers: (layers: AnyLayer[]) => void;
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
		this.zoom = 13.5;
	}

	initializeMap() {
		console.log("[DEBUG]: initializeMap called");
		this.map.current = new mapboxgl.Map({
			container: this.mapContainer.current,
			style: "mapbox://styles/mapbox/streets-v9",
			center: [this.lng, this.lat],
			zoom: this.zoom,
			accessToken: MAPBOX_TOKEN
		});
	}

	addSources(ids: string[], sources: AnySourceData[]) {
		sources.forEach((source, idx) => {
			if (!this.map.current.getSource(ids[idx]))
				this.map.current.addSource(ids[idx], source);
		})

	}

	addLayers(layers: AnyLayer[])  {
		console.log("[DEBUG]: addLayers called");
		layers.forEach((layer) => {
			if (!this.map.current.getLayer(layer.id))
				this.map.current.addLayer(layer);
		})
	}
}

export default MapModel;