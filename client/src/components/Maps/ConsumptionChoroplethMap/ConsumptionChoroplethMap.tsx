import './ConsumptionChoroplethMap.css';
import React from 'react';
import UrbanZoneMap from '../UrbanZonesMap/UrbanZoneMap';
import { FeatureCollection } from 'geojson';
import { changeRange } from 'scripts/utils';
import { getTotalConsumption } from 'scripts/api';

interface Props {
	t1: number,
	t2: number,
	highlightedZoneName: string | null,
}

const colorPalette = ['#7fd1ef', '#6ab3e1', '#5395d4', '#3779c6', '#005eb8'];

export default class ConsumptionChoroplethMap extends React.Component<Props, {}> {
	private async zoneTransformer(zones: FeatureCollection): Promise<FeatureCollection> {
		const consumptions = await Promise.all(zones.features.map(f => getTotalConsumption(this.props.t1, this.props.t2, undefined, f.properties.libelle)));
		const minValue = Math.min(...consumptions);
		const maxValue = Math.max(...consumptions);

		return {
			type: 'FeatureCollection',
			features: zones.features.map((f, i) => {
				const value = Math.round(changeRange(consumptions[i], minValue, maxValue, 0, colorPalette.length - 1));
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
			<div className="choropleth-map-wrapper">
				{/* <div className="choropleth-map-title-wrapper">
					Comparaison du taux de consommation entre chaque zone urbaine du quartier
				</div> */}

				<div id="urbanZoneComparisonMap" className="choropleth-map">
					<UrbanZoneMap
						center={[-0.5564, 44.8431]}
						bounds={[
							[-0.5463, 44.8522],
							[-0.5665, 44.8382],
						]}
						zoom={15.5}
						pitch={42}
						zonesTransformer={zones => this.zoneTransformer(zones)}
						zonesFillColor={{
							property: 'choroplethValue',
							stops: colorPalette.map((color, idx) => [idx, color]),
						}}
						highlightedZoneName={this.props.highlightedZoneName}
					/>
				</div>

				{/* Removed for responsive purposes
				<div className="color-wrapper">
					<div className="high-end-color-wrapper">
						<div className="high-end-color" />
						<p className="high-end-text">Forte consommation</p>
					</div>
					<div className="low-end-color-wrapper">
						<div className="low-end-color" />
						<p className="low-end-text">Faible consommation</p>
					</div>
				</div>
				*/}
			</div>
		);
	}
}
