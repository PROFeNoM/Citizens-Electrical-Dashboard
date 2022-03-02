import React, {useEffect} from 'react';
import mapboxgl from "mapbox-gl";
import MapView from "./MapboxMapView";
import MapModel, {MapState} from "./MapboxMapModel";

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';

function MapController() {
	const mapModel: MapState = new MapModel();

	useEffect(() => {
		if (mapModel.map.current) return;  // initialize map only once
		mapModel.map.current = new mapboxgl.Map({
			container: mapModel.mapContainer.current,
			style: "mapbox://styles/mapbox/streets-v9",
			center: [mapModel.lng, mapModel.lat],
			zoom: mapModel.zoom,
			accessToken: MAPBOX_TOKEN
		});
	})

	return (
		<MapView mapContainer={mapModel.mapContainer} />
	);
}

export default MapController;