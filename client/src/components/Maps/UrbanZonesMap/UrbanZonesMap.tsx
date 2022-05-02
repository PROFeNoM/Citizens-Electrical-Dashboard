import React from 'react';
import { FillExtrusionLayer, FillLayer, LineLayer, CircleLayer } from 'react-map-gl';

import { Indicator, IndicatorClass } from 'constants/indicator';
import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import {
	allBuildings3D, residentialBuildings3D,
	zonesBorder, zonesFill,
	consumptionBorder, consumptionFill,
	productionBorder, productionFill,
	lightingPoints,
	bornesPoints,
} from '../layers';
import { zonesGeoJSON, buildingsGeoJSON, publicLightingGeoJSON, bornesGeoJSON } from 'geodata';
import { ConsumerProfile, ProducerProfile, getTotalConsumption, getTotalProduction } from 'scripts/api';
import { changeRange } from 'scripts/utils';

const zonesFillColor = '#7fd1ef';
const colorPalette = {
	red: ['#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c'],
	green: ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20'],
	blue: ['#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1'],
	yellow: ['#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17']
}

const sources: { id: string; data: FeatureCollection }[] = [];
const layers: { id: string; data: FillExtrusionLayer | FillLayer | LineLayer | CircleLayer }[] = [];

interface Props extends BaseMapProps {
	indicator?: Indicator;
	/** Triggered on a click on the map. If the click is performed outside a zone, featureId and zoneName are null. */
	onZoneClick?: (featureId: string | number | null, zoneName: string | null) => void;
	highlightedZoneName?: string;
	t1: number;
	t2: number;
	buildingType: ConsumerProfile;
}

interface State {
	highlightedZone: string | number;
}

/**
 * Urban zones map
 * 
 * Base map with a layer for the zones and a layer for the buildings.
 * // TODO: add a layer for the lighting points
 */
export default class UrbanZonesMap extends React.Component<Props, State> {
	private mapRef = React.createRef<BaseMap>();

	constructor(props: Props) {
		super(props);

		this.state = {
			highlightedZone: null
		};

		this.cancelZoneHighlighting = this.cancelZoneHighlighting.bind(this);
		this.highlightZone = this.highlightZone.bind(this);
		this.cursorStyle = this.cursorStyle.bind(this);
		this.updateLayers = this.updateLayers.bind(this);
	}

	get map() {
		return this.mapRef.current.map;
	}

	/**
	 * Highlight a zone by thickening its border.
	 * 
	 * @param id The id of the zone to highlight.
	 */
	private highlightZone(id: string | number) {
		if (this.state.highlightedZone === id) {
			return;
		}

		sources.forEach(source => {
			this.map.setFeatureState(
				{ source: source.id, id: this.state.highlightedZone },
				{ hover: false }
			);
			this.map.setFeatureState(
				{ source: source.id, id: id },
				{ hover: true }
			);
		});

		this.setState((state) => ({
			...state,
			highlightedZone: id
		}));
	}

	private cancelZoneHighlighting() {
		if (this.state.highlightedZone === null) {
			return;
		}

		sources.forEach(source => {
			this.map.setFeatureState(
				{ source: source.id, id: this.state.highlightedZone },
				{ hover: false }
			);
		});

		this.setState((state) => ({
			...state,
			highlightedZone: null,
		}));
	}

	private cursorStyle() {
		return this.state.highlightedZone !== null && this.props.onZoneClick !== undefined
			? 'pointer' : 'inherit';
	}

	/**
	 * Display or hide layers according to the current indicator.
	 * TODO: show residential or lighting points layers if chosen
	 */
	private updateLayers() {
		const layersToShow: string[] = [];
		layersToShow.push('3d-buildings');

		switch (this.props.indicator.class) {
			case IndicatorClass.Consumption:
				layersToShow.push('consumption-data', 'consumption-border');
				break;
			case IndicatorClass.Production:
				layersToShow.push('production-data', 'production-border');
				break;
			case IndicatorClass.Station:
				layersToShow.push('urban-zones-data', 'urban-zones-border', 'charging-stations-points');
				break;
			case IndicatorClass.General:
			default:
				layersToShow.push('urban-zones-data', 'urban-zones-border');
				break;
		}

		switch (this.props.buildingType) {
			case ConsumerProfile.RESIDENTIAL:
				layersToShow.push('3d-residential-buildings');
				break;
			case ConsumerProfile.PUBLIC_LIGHTING:
				layersToShow.push('lighting-points');
				break;
			default:
				break;
		}

		// Show the layers in layersToShow and hide the others
		layers.forEach(layer => {
			if (layersToShow.includes(layer.id)) {
				this.map.setLayoutProperty(layer.id, 'visibility', 'visible')
			} else {
				this.map.setLayoutProperty(layer.id, 'visibility', 'none')
			}
		});
	}

	async getConsumptionData(zones: FeatureCollection): Promise<FeatureCollection> {
		const consumptions = await Promise.all(zones.features.map(f => getTotalConsumption(this.props.t1, this.props.t2, undefined, f.properties.libelle)));
		const minValue = Math.min(...consumptions);
		const maxValue = Math.max(...consumptions);

		return {
			type: 'FeatureCollection',
			features: zones.features.map((f, i) => {
				const value = Math.round(changeRange(consumptions[i], minValue, maxValue, 0, colorPalette.red.length - 1));
				const properties = {
					...f.properties,
					choroplethValue: value
				};
				return { ...f, properties };
			}),
		};
	}

	async getProductionData(zones: FeatureCollection): Promise<FeatureCollection> {
		const productions = await Promise.all(zones.features.map(f => getTotalProduction(this.props.t1, this.props.t2, [ProducerProfile.SOLAR], f.properties.libelle)));
		const minValue = Math.min(...productions);
		const maxValue = Math.max(...productions);

		return {
			type: 'FeatureCollection',
			features: zones.features.map((f, i) => {
				const value = Math.round(changeRange(productions[i], minValue, maxValue, 0, colorPalette.red.length - 1));
				const properties = {
					...f.properties,
					choroplethValue: value
				};
				return { ...f, properties };
			}),
		};
	}

	/**
	 * @brief Add the map's sources and layers.
	 * 
	 * Fetch the consumption and production data for the zones,
	 * add the source and the layers
	 * and display the layers based on the selected parameters.
	 */
	async componentDidMount() {
		await this.mapRef.current.ensureMapLoading();

		// Add zones sources and layers
		sources.push({ id: 'urban-zones', data: zonesGeoJSON });
		layers.push({ id: 'urban-zones-data', data: zonesFill(zonesFillColor) });
		layers.push({ id: 'urban-zones-border', data: zonesBorder });

		// Add energy sources
		try {
			// Get zones consumption and production data
			const [consumptionData, productionData] = await Promise.all([
				this.getConsumptionData(zonesGeoJSON),
				this.getProductionData(zonesGeoJSON)
			]);

			sources.push({ id: 'consumption', data: consumptionData });
			layers.push({
				id: 'consumption-data',
				data: consumptionFill({
					property: 'choroplethValue',
					stops: colorPalette.blue.map((color, idx) => [idx, color]),
				})
			});
			layers.push({ id: 'consumption-border', data: consumptionBorder });

			sources.push({ id: 'production', data: productionData });
			layers.push({
				id: 'production-data',
				data: productionFill({
					property: 'choroplethValue',
					stops: colorPalette.yellow.map((color, idx) => [idx, color]),
				})
			});
			layers.push({ id: 'production-border', data: productionBorder });
		} catch (e) {
			console.error('Cannot load energy data', e);
		}

		// Add in last layers that should be on top (buildings and points)
		sources.push({ id: 'district-buildings', data: buildingsGeoJSON });
		layers.push({ id: '3d-buildings', data: allBuildings3D });
		layers.push({ id: '3d-residential-buildings', data: residentialBuildings3D });
		sources.push({ id: 'public-lighting', data: publicLightingGeoJSON });
		layers.push({ id: 'lighting-points', data: lightingPoints });
		sources.push({ id: 'charging-stations', data: bornesGeoJSON });
		layers.push({ id: 'charging-stations-points', data: bornesPoints });

		sources.forEach(source => {
			this.map.addSource(source.id, {
				type: 'geojson',
				data: source.data,
				generateId: true
			});
		});

		layers.forEach(layer => {
			this.map.addLayer(layer.data);
		});

		// .on('mouseenter', 'data', e => this.highlightZone(e.features[0].id))
		// .on('mousemove', 'data', e => this.highlightZone(e.features[0].id))
		// .on('mouseleave', 'data', () => this.cancelZoneHighlighting());

		this.updateLayers();

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

	/**
	 * @brief Highlight a zone if necessary and update the display of the layers.
	 */
	async componentDidUpdate() {
		await this.mapRef.current.ensureMapLoading();

		if (this.props.highlightedZoneName) {
			const featureId = zonesGeoJSON.features.findIndex(f => f.properties.libelle === this.props.highlightedZoneName);
			this.highlightZone(featureId);
		}
		else {
			this.cancelZoneHighlighting();
		}

		this.updateLayers();
	}

	/**
	 * @brief Unload the map.
	 * 
	 * Remove all layers and sources from the map, empty sources and layers arrays.
	 */
	componentWillUnmount(): void {
		layers.forEach(layer => {
			if (this.map.getLayer(layer.id)) {
				this.map.removeLayer(layer.id);
			}
		});

		sources.forEach(source => {
			if (this.map.getSource(source.id)) {
				this.map.removeSource(source.id);
			}
		});

		layers.length = 0;
		sources.length = 0;
	}

	render() {
		return (
			<div
				id="urban-zones-map"
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
