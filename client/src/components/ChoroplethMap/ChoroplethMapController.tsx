import './ChoroplethMap.css'
import React from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import ChoroplethMapView from "./ChoroplethMapView";
import ChoroplethMapModel, {ChoroplethMapState} from "./ChoroplethMapModel";

class ChoroplethMapController extends React.Component<any, any> {
	private choroplethMapModel: ChoroplethMapState;

	constructor(props) {
		super(props);
		this.choroplethMapModel = new ChoroplethMapModel();
	}

	componentDidMount() {
		console.log("[DEBUG]: componentDidMount called");
		this.choroplethMapModel.updateData(() => {
			this.choroplethMapModel.mapModel.initializeMap();
			this.choroplethMapModel.mapModel.map.current.on('load', () => {
				let hoveredStateId: any = null;
				this.choroplethMapModel.mapModel.addSources(['urbanZone-source', 'district-buildings'], [
					{
						'type': 'geojson',
						'data': this.choroplethMapModel.data,
						'generateId': true
					},
					{
						'type': 'geojson',
						'data': this.choroplethMapModel.buildingData,
						'generateId': true
					}
				])

				this.choroplethMapModel.mapModel.addLayers([dataLayer, polyStyle, buildings3D]);

				this.choroplethMapModel.mapModel.map.current.on('mousemove', 'data', (e) => {
					// @ts-ignore
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							this.choroplethMapModel.mapModel.map.current.setFeatureState(
								{source: 'urbanZone-source', id: hoveredStateId},
								{hover: false}
							);
						}
						// @ts-ignore
						hoveredStateId = e.features[0].id;
						this.choroplethMapModel.mapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: true}
						);
					}
				});

				this.choroplethMapModel.mapModel.map.current.on('mouseleave', 'data', () => {
					if (hoveredStateId !== null) {
						this.choroplethMapModel.mapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: false}
						);
					}
					hoveredStateId = null;
				});
			});
		});
	}

	render() {
		return (
			<ChoroplethMapView mapContainer={this.choroplethMapModel.mapModel.mapContainer}/>
		);
	}
}

export default ChoroplethMapController;
