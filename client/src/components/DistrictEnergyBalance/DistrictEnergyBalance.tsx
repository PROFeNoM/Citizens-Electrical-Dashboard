import React from 'react';
import './DistrictEnergyBalance.css';
import {
	Building,
	getDistrictArea,
	getDistrictElectricityConsumption,
	getDistrictElectricityProduction,
	getDistrictNumberOfBuildings,
	getDistrictNumberOfSites
} from '../../scripts/dbUtils';

const nbSites: number = getDistrictNumberOfSites(Building.Residential)
	+ getDistrictNumberOfSites(Building.Professional)
	+ getDistrictNumberOfSites(Building.Tertiary);
const nbBuildings: number = getDistrictNumberOfBuildings();
const area: string = new Intl.NumberFormat().format(Math.round(getDistrictArea()));

interface State {
	consumption: string,
	production: string,
	ratio: string,
}

export default class DistrictEnergyBalance extends React.Component<{}, State> {
	constructor(props) {
		super(props);
		this.state = {
			consumption: '...',
			production: '...',
			ratio: '...',
		};
	}

	async componentDidMount() {
		const t1 = new Date('2021-12-01T00:30:00').getTime();
		const t2 = new Date('2021-12-31T23:30:00').getTime();
		const [consumption, production] = await Promise.all([
			getDistrictElectricityConsumption(t1, Building.All, t2),
			getDistrictElectricityProduction(t1, t2),
		]);
		const formatter = new Intl.NumberFormat();
		this.setState({
			consumption: formatter.format(Math.round(consumption / 1_000_000)),
			production: formatter.format(Math.round(production / 1_000_000)),
			ratio: Math.round(production / consumption * 100).toString(),
		});
	}

	render() {
		return (
			<div id="district-info-wrapper">
				<div id="district-info">
					<h2 id="district-name">Quartier de la Bastide</h2>
					<ul>
						<li><span className='data'>{area}</span> m²</li>
						<li><span className='data'>{nbBuildings}</span> bâtiments</li>
						<li><span className='data'>{nbSites}</span> consommateurs</li>
						<li><span className='data'>{this.state.consumption}</span> MWh/mois d'électricité consommée</li>
						<li><span className='data'>{this.state.production}</span> MWh/mois d'électricité produite</li>
						<li><span className='data'>{this.state.ratio}</span> % de ratio production/consommation</li>
					</ul>
					<div id="zone-hint">Cliquez sur une zone urbaine pour en savoir plus.</div>
				</div>
			</div>
		);
	}
}
