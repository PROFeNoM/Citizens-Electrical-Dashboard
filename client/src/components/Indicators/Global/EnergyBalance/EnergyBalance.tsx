import './EnergyBalance.css';

import React from 'react';
import copy from 'fast-copy';

import { getZonesNames, getZoneArea, getZoneNbOfBuildings, getZoneNbOfCollectionSites } from 'scripts/dbUtils';
import { ConsumerProfile, getTotalConsumption, getTotalProduction } from 'scripts/api';

const formatter = new Intl.NumberFormat();

interface Data {
	area: number;
	nbOfBuildings: number;
	nbOfConsumers: number;
	consumption?: number;
	production?: number;
}

interface Props {
	zoneName: string; // Name of the selected zone
}

interface State {
	districtData: Data; // Data for the entire district
	zonesData: { [name: string]: Data }; // Data for a specific zone
}

/**
 * Component that displays general informations about a zone.
 * - The area of the zone (m²)
 * - The number of buildings in the zone
 * - The number of consumers in the zone
 * - The total consumption of the zone in the given time (MWh)
 * - The total production of the zone in the given time (MWh)
 * - The ratio between the total consumption and the total production of the zone
 */
export default class EnergyBalance extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			districtData: {
				area: 0,
				nbOfBuildings: 0,
				nbOfConsumers: 0
			},
			zonesData: {}
		};

		for (const zoneName of getZonesNames()) {
			this.state.zonesData[zoneName] = {
				area: getZoneArea(zoneName),
				nbOfBuildings: getZoneNbOfBuildings(zoneName),
				nbOfConsumers: getZoneNbOfCollectionSites(zoneName, ConsumerProfile.RESIDENTIAL)
					+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PROFESSIONAL)
					+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.TERTIARY)
			};

			this.state.districtData.area += this.state.zonesData[zoneName].area;
			this.state.districtData.nbOfBuildings += this.state.zonesData[zoneName].nbOfBuildings;
			this.state.districtData.nbOfConsumers += this.state.zonesData[zoneName].nbOfConsumers;
		}
	}

	/**
	 * Fetch the data for the current zone and update the state.
	 */
	async fetchData() {
		const t1 = new Date('2021-12-01T00:30:00').getTime();
		const t2 = new Date('2021-12-31T23:30:00').getTime();

		let districtConsumption = 0;
		let districtProduction = 0;

		await Promise.all(getZonesNames().map(async zoneName => {
			const [zoneConsumption, zoneProduction] = await Promise.all([
				getTotalConsumption(t1, t2, undefined, zoneName),
				getTotalProduction(t1, t2, undefined, zoneName),
			]);

			this.setState(oldState => {
				const newState = copy(oldState);
				newState.zonesData[zoneName].consumption = zoneConsumption;
				newState.zonesData[zoneName].production = zoneProduction;
				return newState
			});

			districtConsumption += zoneConsumption;
			districtProduction += zoneProduction;
		}));

		this.setState(oldState => {
			const newState = copy(oldState);
			newState.districtData.consumption = districtConsumption;
			newState.districtData.production = districtProduction;
			return newState;
		})
	}

	async componentDidMount() {
		await this.fetchData();
	}

	/*async componentDidUpdate() {
		await this.fetchData();
	}*/

	private get currentData(): Data {
		return this.props.zoneName !== null
			? this.state.zonesData[this.props.zoneName]
			: this.state.districtData;
	}

	render() {
		const data = this.currentData;
		const nbBuildings = formatter.format(data.nbOfBuildings);
		const area = formatter.format(Math.round(data.area));
		const nbOfConsumers = formatter.format(data.nbOfConsumers);
		const consumption = data.consumption !== undefined ? formatter.format(Math.round(data.consumption / 1_000_000)) : '...';
		const production = data.production !== undefined ? formatter.format(Math.round(data.production / 1_000_000)) : '...';
		const ratio = data.consumption !== undefined && data.production !== undefined ? formatter.format(Math.round(data.production / data.consumption * 100)) : '...';

		return (
			<div id="energy-balance-wrapper">
				<div id="energy-balance">
					<ul>
					<li><span className="data">{area}</span> m²</li>
						<li><span className="data">{nbBuildings}</span> bâtiments</li>
						<li><span className="data">{nbOfConsumers}</span> consommateurs</li>
						<li><span className="data">{consumption}</span> MWh/mois d'électricité consommée</li>
						<li><span className="data">{production}</span> MWh/mois d'électricité produite</li>
						<li><span className="data">{ratio}</span> % de ratio production/consommation</li>
					</ul>
				</div>
			</div>
		);
	}
}
