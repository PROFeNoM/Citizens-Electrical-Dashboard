import './BalanceMap.css'
import React, { MutableRefObject } from 'react';
import {buildings3D, dataLayer, polyStyle} from './map-style';
import BaseMap from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import { updateProperties } from './utils';

const json_Decoupage_urbain = require("../../map/layers/Decoupage_urbain.json") as FeatureCollection;
const json_Batiment_Bordeaux_Bastide_TEC = require("../../map/layers/Batiment_Bordeaux_Bastide_TEC.json") as FeatureCollection;

interface Props {
	currentZone: string,
}

export default class BalanceMap extends React.Component<Props, {}> {
	private mapRef: MutableRefObject<BaseMap> = React.createRef();

	constructor(props) {
		super(props);
		this.state = {
			sources: {},
			layers: [],
		};
	}

	async componentDidMount() {
		const data = await updateProperties(
			json_Decoupage_urbain,
			this.props.currentZone,
		);

		let hoveredFeature: string | number = null;

		this.mapRef.current.map
			.addSource('urbanZone-source', {
				type: 'geojson',
				data: data,
				generateId: true,
			})
			.addSource('district-buildings', {
				type: 'geojson',
				data: json_Batiment_Bordeaux_Bastide_TEC,
				generateId: true,
			})
			.addLayer(dataLayer)
			.addLayer(polyStyle)
			.addLayer(buildings3D)
			.on('mouseenter', 'data', e => {
				if (e.features.length === 0) {
					return;
				}
				hoveredFeature = e.features[e.features.length - 1].id;
				this.mapRef.current.map.setFeatureState(
					{ source: 'urbanZone-source', id: hoveredFeature },
					{ hover: true }
				);
			})
			.on('mouseleave', 'data', () => {
				if (hoveredFeature === null) {
					return;
				}
				this.mapRef.current.map.setFeatureState(
					{ source: 'urbanZone-source', id: hoveredFeature },
					{ hover: false }
				);
				hoveredFeature = null;
			});
	}

	render() {
		return (
			<div className='balance-map-wrapper'>
				<div id="BalanceMap" className="balance-map">
					<BaseMap ref={this.mapRef} />
				</div>
			</div>
		);
	}
}
