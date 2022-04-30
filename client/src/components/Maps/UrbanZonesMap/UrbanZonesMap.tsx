import React from 'react';

import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import { lightingPoints, allBuildings3D, bornesPoints, residentialBuildings3D, FillColor, zonesBorder, zonesFill } from '../layers';
import { zonesGeoJSON, buildingsGeoJSON, lightingGeoJSON, bornesGeoJSON } from 'geodata';

const defaultZonesFillColor = '#7fd1ef';

interface Props extends BaseMapProps {
	zonesTransformer?: (zones: FeatureCollection) => Promise<FeatureCollection>;
	zonesFillColor?: FillColor;
	/** Triggered on a click on the map. If the click is performed outside a zone, featureId and zoneName are null. */
	onZoneClick?: (featureId: string | number | null, zoneName: string | null) => void;
	highlightedZoneName?: string;
}

interface State {
	hoveredZone: string | number;
	transformedZones: FeatureCollection;
}

/**
 * Urban zones map
 * 
 * Base map with a layer for the zones and a layer for the buildings.
 * // TODO: add a layer for the lighting points and a layer for the charging stations based on the state
 */
export default class UrbanZonesMap extends React.Component<Props, State> {
	private mapRef = React.createRef<BaseMap>();

	constructor(props: Props) {
		super(props);

		this.state = {
			hoveredZone: null,
			transformedZones: null
		};

		this.cancelZoneHover = this.cancelZoneHover.bind(this);
		this.hoverZone = this.hoverZone.bind(this);
		this.cursorStyle = this.cursorStyle.bind(this);
	}

	async componentDidMount() {
		// Wait for map loading and apply zonesTransformer on parallel
		const [, transformedZones] = await Promise.all([
			this.mapRef.current.ensureMapLoading(),
			this.props.zonesTransformer ? (await this.props.zonesTransformer(zonesGeoJSON)) : zonesGeoJSON,
		])

		this.setState({
			transformedZones,
		})

		this.map
			.addSource('urban-zones', {
				type: 'geojson',
				data: transformedZones,
				generateId: true,
			})
			.addSource('district-buildings', {
				type: 'geojson',
				data: buildingsGeoJSON,
				generateId: true,
			})
			// .addSource('public-lighting', {
			// 	type: 'geojson',
			// 	data: Lighting,
			// 	generateId: true,
			// })
			.addSource('charging-stations', {
				type: 'geojson',
				data: bornesGeoJSON,
				generateId: true,
			})
			.addLayer(zonesFill(this.props.zonesFillColor ?? defaultZonesFillColor))
			.addLayer(zonesBorder)
			.addLayer(allBuildings3D)
		// .addLayer(residentialBuildings3D)
		// .addLayer(lightingPoints) // cette layer ne marche pas a cause de la natur du fichier geojson
		// .addLayer(bornesPoints)
		// .on('mouseenter', 'data', e => this.hoverZone(e.features[0].id))
		// .on('mousemove', 'data', e => this.hoverZone(e.features[0].id))
		// .on('mouseleave', 'data', () => this.cancelZoneHover());
		this.cancelZoneHover();
		if (this.props.onZoneClick) {
			// detect click on a zone
			this.map.on('click', 'data', e => {
				e.preventDefault();
				this.props.onZoneClick(e.features[0].id, e.features[0].properties.libelle);
			});
			// detect click outside a zone
			this.map.on('click', e => {
				if (!e.defaultPrevented) {
					this.props.onZoneClick(null, null);
				}
			});
		}
	}

	async componentDidUpdate() {
		await this.mapRef.current.ensureMapLoading();

		if (this.props.highlightedZoneName) {
			const featureId = this.state.transformedZones.features.findIndex(f => f.properties.libelle === this.props.highlightedZoneName);
			this.hoverZone(featureId);
		}
		else {
			this.cancelZoneHover();
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
				{ source: 'urban-zones', id: this.state.hoveredZone },
				{ hover: false }
			);
		}

		this.map.setFeatureState(
			{ source: 'urban-zones', id },
			{ hover: true }
		);

		this.setState((state) => ({
			...state,
			hoveredZone: id
		}));
	}

	private cancelZoneHover() {
		if (this.state.hoveredZone === null) {
			return;
		}

		this.map.setFeatureState(
			{ source: 'urban-zones', id: this.state.hoveredZone },
			{ hover: false }
		);

		this.setState((state) => ({
			...state,
			hoveredZone: null,
		}));
	}

	private cursorStyle() {
		return this.state.hoveredZone !== null && this.props.onZoneClick !== undefined
			? 'pointer' : 'inherit';
	}

	render() {
		return (
			<div
				style={{
					cursor: this.cursorStyle(),
					height: '100%',
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
