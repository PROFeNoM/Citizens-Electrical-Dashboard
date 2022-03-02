import React from 'react';
import MapView from "./MapboxMapView";
import MapModel, {MapState} from "./MapboxMapModel";

class MapController extends React.Component<any, any> {
	private mapModel: MapState;
	constructor(props) {
		super(props);
		this.mapModel = new MapModel();
	}

	componentDidMount() {
		this.mapModel.initializeMap();
	}

	render() {
		return (
			<MapView mapContainer={this.mapModel.mapContainer} />
		);
	}
}

export default MapController;