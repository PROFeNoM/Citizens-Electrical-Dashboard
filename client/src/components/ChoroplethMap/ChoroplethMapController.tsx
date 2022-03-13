import './ChoroplethMap.css'
import React from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import ChoroplethMapView from "./ChoroplethMapView";
import ChoroplethMapModel from "./ChoroplethMapModel";

interface Props {
	t1: number,
	t2: number,
}

interface State {
	t1: number,
	t2: number,
}

class ChoroplethMapController extends React.Component<Props, State> {
	private choroplethMapModel: ChoroplethMapModel;

	constructor(props) {
		super(props);
		this.state = {
			t1: props.t1,
			t2: props.t2,
		}
		this.choroplethMapModel = new ChoroplethMapModel();
	}

	componentDidMount() {
		this.choroplethMapModel.updateData(this.state.t1, this.state.t2, () => {
			this.choroplethMapModel.initializeMap();
			this.choroplethMapModel.map.current.on('load', () => {
				let hoveredStateId: any = null;
				this.choroplethMapModel.addSources(['urbanZone-source', 'district-buildings'], [
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
				]);

				this.choroplethMapModel.addLayers([dataLayer, polyStyle, buildings3D]);

				this.choroplethMapModel.map.current.on('mousemove', 'data', (e) => {
					// @ts-ignore
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							this.choroplethMapModel.map.current.setFeatureState(
								{source: 'urbanZone-source', id: hoveredStateId},
								{hover: false}
							);
						}
						// @ts-ignore
						hoveredStateId = e.features[0].id;
						this.choroplethMapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: true}
						);
					}
				});

				this.choroplethMapModel.map.current.on('mouseleave', 'data', () => {
					if (hoveredStateId !== null) {
						this.choroplethMapModel.map.current.setFeatureState(
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
			<ChoroplethMapView mapContainer={this.choroplethMapModel.mapContainer}/>
		);
	}
}

export default ChoroplethMapController;
