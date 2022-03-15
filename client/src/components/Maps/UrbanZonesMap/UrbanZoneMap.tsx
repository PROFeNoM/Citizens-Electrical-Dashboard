import React from 'react';
import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import { buildings3D, FillColor, zonesBorder, zonesFill } from '../layers';

const zones = require('../../../map/layers/Decoupage_urbain.json') as FeatureCollection;
const buildings = require('../../../map/layers/Batiment_Bordeaux_Bastide_TEC.json') as FeatureCollection;

interface Props extends BaseMapProps {
	zonesTransformer?: (zones: FeatureCollection) => Promise<FeatureCollection>,
	zonesFillColor?: FillColor,
}

export default class UrbanZoneMap extends React.Component<Props, {}> {
	private mapRef = React.createRef<BaseMap>();
	private hoveredZone: string | number = null;

	async componentDidMount() {
		// wait for map loading and apply zonesTransformer on parallel
		const [, transformedZones] = await Promise.all([
			this.mapRef.current.ensureMapLoading(),
			this.props.zonesTransformer ? (await this.props.zonesTransformer(zones)) : zones,
		])

		this.map
			.addSource('urbanZone-source', {
				type: 'geojson',
				data: transformedZones,
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
		this.hoveredZone = null;
	}

	render() {
		return <BaseMap
			ref={this.mapRef}
			center={this.props.center}
			bounds={this.props.bounds}
			zoom={this.props.zoom}
			pitch={this.props.pitch}
		/>;
	}
}
