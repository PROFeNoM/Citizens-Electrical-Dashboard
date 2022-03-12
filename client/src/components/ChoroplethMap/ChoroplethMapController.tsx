import './ChoroplethMap.css'
import React from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import ChoroplethMapView from "./ChoroplethMapView";
import ChoroplethMapModel from "./ChoroplethMapModel";

class ChoroplethMapController extends React.Component<any, any> {
	constructor(props: {
		t1: number,
		t2: number
	}) {
		super(props);
		this.state = {
			t1: props.t1,
			t2: props.t2,
			choroplethMapModel: new ChoroplethMapModel()
		}
	}

	componentDidMount() {
		this.state.choroplethMapModel.updateData(this.state.t1, this.state.t2, () => {
			this.state.choroplethMapModel.mapModel.initializeMap();
			this.state.choroplethMapModel.mapModel.map.current.on('load', () => {
				let hoveredStateId: any = null;
				this.state.choroplethMapModel.mapModel.addSources(['urbanZone-source', 'district-buildings'], [
					{
						'type': 'geojson',
						'data': this.state.choroplethMapModel.data,
						'generateId': true
					},
					{
						'type': 'geojson',
						'data': this.state.choroplethMapModel.buildingData,
						'generateId': true
					}
				]);

				this.state.choroplethMapModel.mapModel.addLayers([dataLayer, polyStyle, buildings3D]);

				this.state.choroplethMapModel.mapModel.map.current.on('mousemove', 'data', (e) => {
					// @ts-ignore
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							this.state.choroplethMapModel.mapModel.map.current.setFeatureState(
								{source: 'urbanZone-source', id: hoveredStateId},
								{hover: false}
							);
						}
						// @ts-ignore
						hoveredStateId = e.features[0].id;
						this.state.choroplethMapModel.mapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: true}
						);
					}
				});

				this.state.choroplethMapModel.mapModel.map.current.on('mouseleave', 'data', () => {
					if (hoveredStateId !== null) {
						this.state.choroplethMapModel.mapModel.map.current.setFeatureState(
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
			<ChoroplethMapView mapContainer={this.state.choroplethMapModel.mapModel.mapContainer}/>
		);
	}
}

export default ChoroplethMapController;
