import './BalanceMap.css'
import React from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import BalanceMapView from "./BalanceMapView";
import BalanceMapModel from "./BalanceMapModel";

interface Props {
	curentZone: string,
}

class BalanceMapController extends React.Component<Props, {}> {
	private balanceMapModel: BalanceMapModel;

	constructor(props) {
		super(props);
		this.balanceMapModel = new BalanceMapModel();
	}

	componentDidMount() {
		console.log("[DEBUG]: componentDidMount called");
		console.log(this.props.curentZone);
		console.log(this.balanceMapModel.data.features[0].properties.libelle)

		this.balanceMapModel.updateData(() => {
			this.balanceMapModel.initializeMap();
			console.log(this.balanceMapModel.data)
			this.balanceMapModel.map.current.on('load', () => {
				let hoveredStateId: any = null;
				this.balanceMapModel.addSources(['urbanZone-source', 'district-buildings'], [
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
	
				this.balanceMapModel.addLayers([dataLayer, polyStyle, buildings3D]);

				this.balanceMapModel.map.current.on('mousemove', 'data', (e) => {
					// @ts-ignore
					if (e.features.length > 0) {
						if (hoveredStateId !== null) {
							this.balanceMapModel.map.current.setFeatureState(
								{source: 'urbanZone-source', id: hoveredStateId},
								{hover: false}
							);
						}
						// @ts-ignore
						hoveredStateId = e.features[0].id;
						this.balanceMapModel.map.current.getCanvas().style.cursor = 'pointer';
						this.balanceMapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: true}
						);
					}
				});

				this.balanceMapModel.map.current.on('mouseleave', 'data', () => {
					if (hoveredStateId !== null) {
						this.balanceMapModel.map.current.getCanvas().style.cursor = '';
						this.balanceMapModel.map.current.setFeatureState(
							{source: 'urbanZone-source', id: hoveredStateId},
							{hover: false}
						);
					}
					hoveredStateId = null;
				});


				this.balanceMapModel.map.current.on('click', 'data', (e) => {
					//Redirect to the urban zone selected balance page
					console.log("[DEBUG] CLICK");
					console.log(e.features);
					window.location.href = '/Balance';
					
				});

			});
		}, this.props.curentZone);
	}

	render() {
		return (
			<BalanceMapView mapContainer={this.balanceMapModel.mapContainer}/>
		);
	}
}

export default BalanceMapController;
