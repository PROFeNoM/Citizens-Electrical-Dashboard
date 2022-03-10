import './BalanceMap.css'
import React from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import BalanceMapView from "./BalanceMapView";
import BalanceMapModel, {BalanceMapState} from "./BalanceMapModel";

class BalanceMapController extends React.Component<any, any> {
	private balanceMapModel: BalanceMapState;

	constructor(props) {
		super(props);
		this.balanceMapModel = new BalanceMapModel();
	}

	componentDidMount() {
		console.log("[DEBUG]: componentDidMount called");
		console.log(this.props.curentZone);
		console.log(this.balanceMapModel.data.features[0].properties.libelle)

		this.balanceMapModel.updateData(() => {
			this.balanceMapModel.mapModel.initializeMap();
			console.log(this.balanceMapModel.data)
			this.balanceMapModel.mapModel.map.current.on('load', () => {
				let hoveredStateId: any = null;
				this.balanceMapModel.mapModel.addSources(['urbanZone-source', 'district-buildings'], [
					{
						'type': 'geojson',
						'data': this.balanceMapModel.data,
						'generateId': true
					},
					{
						'type': 'geojson',
						'data': this.balanceMapModel.buildingData,
						'generateId': true
					}
				])
	
				this.balanceMapModel.mapModel.addLayers([dataLayer, polyStyle, buildings3D]);

				this.balanceMapModel.mapModel.map.current.on('mousemove', 'data', (e) => {
					// @ts-ignore
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							this.balanceMapModel.mapModel.map.current.setFeatureState(
								{source: 'urbanZone-source', id: hoveredStateId},
								{hover: false}
							);
						}
						// @ts-ignore
						hoveredStateId = e.features[0].id;
						this.balanceMapModel.mapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: true}
						);
					}
				});

				this.balanceMapModel.mapModel.map.current.on('mouseleave', 'data', () => {
					if (hoveredStateId !== null) {
						this.balanceMapModel.mapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: false}
						);
					}
					hoveredStateId = null;
				});

				this.balanceMapModel.mapModel.map.current.on('click', 'data', () => {
					//Redirect to the urban zone selected balance page
				});

			});
		}, this.props.curentZone);
	}

	render() {
		return (
			<BalanceMapView mapContainer={this.balanceMapModel.mapModel.mapContainer}/>
		);
	}
}

export default BalanceMapController;
