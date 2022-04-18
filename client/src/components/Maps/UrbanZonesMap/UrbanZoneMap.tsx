import React from 'react';
import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import { lightingPoints, allBuildings3D, bornesPoints, residentialBuildings3D, FillColor, zonesBorder, zonesFill} from '../layers';
import { zones, buildings, Lighting, Bornes } from '../../../geodata';

interface Props extends BaseMapProps {
	zonesTransformer?: (zones: FeatureCollection) => Promise<FeatureCollection>,
	zonesFillColor?: FillColor,
	/** Triggered on a click on the map. If the click is performed outside a zone, featureId and zoneName are null. */
	onZoneClick?: (featureId: string | number | null, zoneName: string | null) => void,
	highlightedZoneName?: string,
}

interface State {
	hoveredZone: string | number,
	transformedZones: FeatureCollection,
}

export default class UrbanZoneMap extends React.Component<Props, State> {
	private mapRef = React.createRef<BaseMap>();

	constructor(props) {
		super(props);
		this.state = {
			hoveredZone: null,
			transformedZones: null
		};
	}

	async componentDidMount() {
		// wait for map loading and apply zonesTransformer on parallel
		const [, transformedZones] = await Promise.all([
			this.mapRef.current.ensureMapLoading(),
			this.props.zonesTransformer ? (await this.props.zonesTransformer(zones)) : zones,
		])

		this.setState({
			transformedZones,
		})

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
			.addSource('Lighting-source', {
				type: 'geojson',
				data: Lighting,
				generateId: true,
			})
			.addSource('Bornes-source', {
				type: 'geojson',
				data: Bornes,
				generateId: true,
			})
			.addLayer(zonesFill(this.props.zonesFillColor ?? '#7fd1ef'))
			.addLayer(zonesBorder)
			.addLayer(allBuildings3D)
			//.addLayer(residentialBuildings3D)      //cette layer marche
			//.addLayer(lightingPoints)  			//cette layer ne marche pas a cause de la natur du fichier geojson
			//.addLayer(bornesPoints)   			//cette layer marche
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

		try {
			this.map
				.addSource('urbanZone-source', {
					type: 'geojson',
					data: this.state.transformedZones,
					generateId: true,
				})
				.addSource('district-buildings', {
					type: 'geojson',
					data: buildings,
					generateId: true,
				})
				.addSource('Lighting-source', {
					type: 'geojson',
					data: Lighting,
					generateId: true,
				})
				.addSource('Bornes-source', {
					type: 'geojson',
					data: Bornes,
					generateId: true,
				})
				.addLayer(zonesFill(this.props.zonesFillColor ?? '#7fd1ef'))
				.addLayer(zonesBorder)
				.addLayer(allBuildings3D)
		} catch (e) {
			//console.error(e);
		} finally {
			if (this.props.highlightedZoneName) {
				const featureId = this.state.transformedZones.features.findIndex(f => f.properties.libelle === this.props.highlightedZoneName);
				if (featureId === this.state.hoveredZone) this.cancelZoneHover();
				else this.hoverZone(featureId);
			} else this.cancelZoneHover();
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
