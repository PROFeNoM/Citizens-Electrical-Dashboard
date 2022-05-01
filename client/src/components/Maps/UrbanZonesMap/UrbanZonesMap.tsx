import React from 'react';
import { FillExtrusionLayer, FillLayer, LineLayer, CircleLayer } from 'react-map-gl';

import { Indicator, IndicatorClass } from 'constants/indicator';
import BaseMap, { BaseMapProps } from '../BaseMap/BaseMap';
import { FeatureCollection } from 'geojson';
import {
	FillColor,
	allBuildings3D, residentialBuildings3D,
	zonesBorder, zonesFill,
	consumptionBorder, consumptionFill,
	productionBorder, productionFill,
	lightingPoints,
	bornesPoints,
} from '../layers';
import { zonesGeoJSON, buildingsGeoJSON, lightingGeoJSON, bornesGeoJSON } from 'geodata';
import { getTotalConsumption, getTotalProduction, ProducerProfile } from 'scripts/api';
import { changeRange } from 'scripts/utils';

const zonesFillColor = '#7fd1ef';
const colorPaletteConsumption = ['#7fd1ef', '#6ab3e1', '#5395d4', '#3779c6', '#005eb8'];
const colorPaletteProduction = ['#faeabf', '#f9da98', '#f6c970', '#f1ba46', '#eaaa00'];

const layers: { id: string; data: FillExtrusionLayer | FillLayer | LineLayer | CircleLayer }[] = [];

interface Props extends BaseMapProps {
	indicator?: Indicator;
	/** Triggered on a click on the map. If the click is performed outside a zone, featureId and zoneName are null. */
	onZoneClick?: (featureId: string | number | null, zoneName: string | null) => void;
	highlightedZoneName?: string;
	t1: number;
	t2: number;
}

interface State {
	hoveredZone: string | number;
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
			hoveredZone: null
		};

		this.cancelZoneHover = this.cancelZoneHover.bind(this);
		this.hoverZone = this.hoverZone.bind(this);
		this.cursorStyle = this.cursorStyle.bind(this);
		this.updateLayers = this.updateLayers.bind(this);
	}

	get map() {
		return this.mapRef.current.map;
	}

	async componentDidMount() {
		await this.mapRef.current.ensureMapLoading();

		const sources: { id: string; data: FeatureCollection }[] = [];

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
					stops: colorPaletteConsumption.map((color, idx) => [idx, color]),
				})
			});
			layers.push({ id: 'consumption-border', data: consumptionBorder });

			sources.push({ id: 'production', data: productionData });
			layers.push({
				id: 'production-data',
				data: productionFill({
					property: 'choroplethValue',
					stops: colorPaletteProduction.map((color, idx) => [idx, color]),
				})
			});
			layers.push({ id: 'production-border', data: productionBorder });
		} catch (e) {
			console.error('Cannot load energy data', e);
		}

		// Add in last layers that should be on top (buildings and points)
		sources.push({ id: 'district-buildings', data: buildingsGeoJSON });
		layers.push({ id: '3d-buildings', data: allBuildings3D });
		// sources.push({ id: 'lighting-data', data: lightingGeoJSON });
		// layers.push({ id: 'lighting-points', data: lightingPoints });
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

		// .on('mouseenter', 'data', e => this.hoverZone(e.features[0].id))
		// .on('mousemove', 'data', e => this.hoverZone(e.features[0].id))
		// .on('mouseleave', 'data', () => this.cancelZoneHover());

		this.updateLayers();

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
			const featureId = zonesGeoJSON.features.findIndex(f => f.properties.libelle === this.props.highlightedZoneName);
			this.hoverZone(featureId);
		}
		else {
			this.cancelZoneHover();
		}

		this.updateLayers();
	}

	/**
	 * Highlight a zone by thickening its border.
	 * TODO: hover also for consumption and production
	 * 
	 * @param id 
	 * @returns 
	 */
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

	/**
	 * Display or hide layers according to the current indicator.
	 * TODO: show residential or lighting points layers if chosen
	 */
	private updateLayers() {
		const showLayers = (layersToShow: string[]) => {
			layers.forEach(layer => {
				if (layersToShow.includes(layer.id)) {
					this.map.setLayoutProperty(layer.id, 'visibility', 'visible')
				} else {
					this.map.setLayoutProperty(layer.id, 'visibility', 'none')
				}
			});
		}

		switch (this.props.indicator.class) {
			case IndicatorClass.Consumption:
				showLayers(['3d-buildings', 'consumption-data', 'consumption-border']);
				break;
			case IndicatorClass.Production:
				showLayers(['3d-buildings', 'production-data', 'production-border']);
				break;
			case IndicatorClass.Station:
				showLayers(['3d-buildings', 'urban-zones-data', 'urban-zones-border', 'charging-stations-points']);
				break;
			case IndicatorClass.General:
			default:
				showLayers(['3d-buildings', 'urban-zones-data', 'urban-zones-border']);
				break;
		}
	}

	async getConsumptionData(zones: FeatureCollection): Promise<FeatureCollection> {
		const consumptions = await Promise.all(zones.features.map(f => getTotalConsumption(this.props.t1, this.props.t2, undefined, f.properties.libelle)));
		const minValue = Math.min(...consumptions);
		const maxValue = Math.max(...consumptions);

		return {
			type: 'FeatureCollection',
			features: zones.features.map((f, i) => {
				const value = Math.round(changeRange(consumptions[i], minValue, maxValue, 0, colorPaletteConsumption.length - 1));
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
				const value = Math.round(changeRange(productions[i], minValue, maxValue, 0, colorPaletteProduction.length - 1));
				const properties = {
					...f.properties,
					choroplethValue: value
				};
				return { ...f, properties };
			}),
		};
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
