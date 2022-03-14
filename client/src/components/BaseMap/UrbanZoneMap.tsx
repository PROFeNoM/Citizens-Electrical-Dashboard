import React from 'react';
import BaseMap from './BaseMap';
import { FeatureCollection } from 'geojson';
import { buildings3D, FillColor, zonesBorder, zonesFill } from './layers';

const zones = require("../../map/layers/Decoupage_urbain.json") as FeatureCollection;
const buildings = require("../../map/layers/Batiment_Bordeaux_Bastide_TEC.json") as FeatureCollection;

interface Props {
	zonesTransformer?: (zones: FeatureCollection) => Promise<FeatureCollection>,
	zonesFillColor?: FillColor,
}

export default class UrbanZoneMap extends React.Component<Props, {}> {
	private mapRef = React.createRef<BaseMap>();
	private hoveredZone: string | number = null;

	async componentDidMount() {
		this.map
			.addSource('urbanZone-source', {
				type: 'geojson',
				data: this.props.zonesTransformer ? (await this.props.zonesTransformer(zones)) : zones,
				generateId: true,
			})
			.addSource('district-buildings', {
				type: 'geojson',
				data: buildings,
				generateId: true,
			})
			.addLayer(zonesFill(this.props.zonesFillColor ?? '#7fd1ef'))
			.addLayer(zonesBorder)
			.addLayer(buildings3D)
			.on('mouseenter', 'data', e => this.hoverZone(e.features[0].id))
			.on('mousemove', 'data', e => this.hoverZone(e.features[0].id))
			.on('mouseleave', 'data', () => this.cancelZoneHover());
	}

	get map() {
		return this.mapRef.current.map;
	}

	private hoverZone(id: string | number) {
		if (this.hoveredZone === id) {
			return;
		}
		this.cancelZoneHover();
		this.map.setFeatureState(
			{ source: 'urbanZone-source', id },
			{ hover: true }
		);
		this.hoveredZone = id;
	}

	private cancelZoneHover() {
		if (this.hoveredZone === null) {
			return;
		}
		this.map.setFeatureState(
			{ source: 'urbanZone-source', id: this.hoveredZone },
			{ hover: false }
		);
	}

	render() {
		return <BaseMap ref={this.mapRef} />;
	}
}
