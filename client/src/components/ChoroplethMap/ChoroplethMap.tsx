import './ChoroplethMap.css';
import React from 'react';
import { updateProperties } from './utils';
import { Building, getUrbanZoneElectricityConsumption } from '../../scripts/dbUtils';
import UrbanZoneMap from '../BaseMap/UrbanZoneMap';

interface Props {
	t1: number,
	t2: number,
}

export default class ChoroplethMap extends React.Component<Props, {}> {
	render() {
		return (
			<div className='choropleth-map-wrapper'>
				<div className='choropleth-map-title-wrapper'>
					Comparaison du taux de consommation entre chaque zone urbaine du quartier
				</div>

				<div id="urbanZoneComparisonMap" className="choropleth-map">
					<UrbanZoneMap zonesTransformer={
						zones => updateProperties(
							zones,
							async f => getUrbanZoneElectricityConsumption(this.props.t1, Building.All, f.properties.libelle, this.props.t2),
						)
					} />
				</div>

				<div className='color-wrapper'>
					<div className='high-end-color-wrapper'>
						<div className='high-end-color'/>
						<p className='high-end-text'>Forte consommation</p>
					</div>
					<div className='low-end-color-wrapper'>
						<div className='low-end-color'/>
						<p className='low-end-text'>Faible consommation</p>
					</div>
				</div>
			</div>
		);
	}
}
