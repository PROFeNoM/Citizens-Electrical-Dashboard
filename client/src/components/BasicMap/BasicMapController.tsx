import React from 'react';
import BasicMapView from "./BasicMapView";
import BasicMapModel from "./BasicMapModel";

class BasicMapController extends React.Component<any, any> {
	private mapModel: BasicMapModel;

	constructor(props) {
		super(props);
		this.mapModel = new BasicMapModel();
	}

	componentDidMount() {
		this.mapModel.initializeMap();
	}

	render() {
		return (
			<BasicMapView mapContainer={this.mapModel.mapContainer} />
		);
	}
}

export default BasicMapController;