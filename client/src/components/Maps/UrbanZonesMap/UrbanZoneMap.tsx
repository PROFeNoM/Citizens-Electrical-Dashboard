import React from 'react';
import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import { buildings3D, FillColor, zonesBorder, zonesFill } from '../layers';

const zones = require('../../../map/layers/Decoupage_urbain.json') as FeatureCollection;
const buildings = require('../../../map/layers/Batiment_Bordeaux_Bastide_TEC.json') as FeatureCollection;

interface Props extends BaseMapProps {
	zonesTransformer?: (zones: FeatureCollection) => Promise<FeatureCollection>,
	zonesFillColor?: FillColor,
	onZoneClick?: (zoneName: string) => void,
}

interface State {
	hoveredZone: string | number,
}

export default class UrbanZoneMap extends React.Component<Props, State> {
	private mapRef = React.createRef<BaseMap>();

	constructor(props) {
		super(props);
		this.state = {
			hoveredZone: null,
		};
	}

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

		if (this.props.onZoneClick) {
			this.map.on('click', 'data', e => this.props.onZoneClick(e.features[0].properties.libelle));
		}
	}

	get map() {
		return this.mapRef.current.map;
	}

	private hoverZone(id: string | number) {
		if (this.state.hoveredZone === id) {
			return;
		}
		if (this.state.hoveredZone !== null) {
			this.map.setFeatureState(
				{ source: 'urbanZone-source', id: this.state.hoveredZone },
				{ hover: false }
			);
		}
		this.map.setFeatureState(
			{ source: 'urbanZone-source', id },
			{ hover: true }
		);
		this.setState({
			hoveredZone: id,
		});
	}

	private cancelZoneHover() {
		if (this.state.hoveredZone === null) {
			return;
		}
		this.map.setFeatureState(
			{ source: 'urbanZone-source', id: this.state.hoveredZone },
			{ hover: false }
		);
		this.setState({
			hoveredZone: null,
		});
	}

	private cursorStyle() {
		if (this.state.hoveredZone !== null && this.props.onZoneClick !== undefined) {
			return 'pointer';
		} else {
			return 'inherit';
		}
	}

	render() {
		return (
			<div
				style={{
					cursor: this.cursorStyle(),
				}}
			>
				<BaseMap
					ref={this.mapRef}
					center={this.props.center}
					bounds={this.props.bounds}
					zoom={this.props.zoom}
					pitch={this.props.pitch}
				/>
			</div>
		);
	}
}
