import './EnergyBalance.css';

import React from 'react';

import { getZonesNames, getZoneArea, getZoneNbOfBuildings, getZoneNbOfCollectionSites } from 'scripts/dbUtils';
import { ConsumerProfile, getTotalConsumption, getTotalProduction } from 'scripts/api';
import { wattsToMegawatts } from 'scripts/utils';

interface Data {
	area: number;
	nbOfBuildings: number;
	nbOfConsumers: number;
	consumption?: number;
	production?: number;
}

interface Props {
	zoneName: string; // Name of the selected zone
	setHighlightedZone: (val: string | null) => void;
	t1: number;
	t2: number;
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

	private get currentData(): Data {
		return this.props.zoneName !== null
			? this.state.zonesData[this.props.zoneName]
			: this.state.districtData;
	}

	/**
	 * Fetch the data for the current zone and update the state.
	 */
	async fetchData() {
		const { t1, t2 } = this.props;
		// Store data to set state only once and avoid multiple rendering
		const districtData: Data = {
			area: this.state.districtData.area,
			nbOfBuildings: this.state.districtData.nbOfBuildings,
			nbOfConsumers: this.state.districtData.nbOfConsumers,
			consumption: 0,
			production: 0
		};
		const zonesData: { [name: string]: Data } = {};

		await Promise.all(getZonesNames().map(async zoneName => {
			const [zoneConsumption, zoneProduction] = await Promise.all([
				getTotalConsumption(t1, t2, undefined, zoneName),
				getTotalProduction(t1, t2, undefined, zoneName),
			]);

			zonesData[zoneName] = {
				area: this.state.zonesData[zoneName].area,
				nbOfBuildings: this.state.zonesData[zoneName].nbOfBuildings,
				nbOfConsumers: this.state.zonesData[zoneName].nbOfConsumers,
				consumption: zoneConsumption,
				production: zoneProduction
			};

			districtData.consumption += zoneConsumption;
			districtData.production += zoneProduction;
		}));

		this.setState({
			districtData,
			zonesData
		});
	}

	async componentDidMount() {
		try {
			await this.fetchData();
		}
		catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.zoneName !== this.props.zoneName || prevProps.t1 !== this.props.t1 || prevProps.t2 !== this.props.t2) {
			try {
				await this.fetchData();
			}
			catch (e) {
				console.error('Error while fetching data', e);
			}
		}
	}

	render() {
		const { area, nbOfBuildings, nbOfConsumers, consumption, production } = this.currentData;
		const formatter = new Intl.NumberFormat(
			'fr-FR',
			{
				style: 'decimal',
				maximumFractionDigits: 2
			}
		);
		const consumptionMegaWatts = consumption !== undefined ?
			formatter.format(wattsToMegawatts(consumption))
			: undefined;
		const productionMegaWatts = production !== undefined ?
			formatter.format(wattsToMegawatts(production))
			: undefined;
		const ratio = consumption !== undefined && production !== undefined ?
			consumption === 0 ?
				0
				: formatter.format(production / consumption * 100)
			: undefined;

		return (
			<div id="energy-balance" className="text-indicator">
				<ul>
					<li><span className="data">{Intl.NumberFormat('fr-FR', {style: 'decimal', maximumFractionDigits: 0}).format(area)}</span> m²</li>
					<li><span className="data">{nbOfBuildings}</span> bâtiments</li>
					<li><span className="data">{nbOfConsumers ?? '...'}</span> consommateurs</li>
					<li><span className="data">{consumptionMegaWatts ?? '...'}</span> MWh d'électricité consommée</li>
					<li><span className="data">{productionMegaWatts ?? '...'}</span> MWh d'électricité produite</li>
					<li><span className="data">{ratio ?? '...'}</span> % de ratio production/consommation</li>
				</ul>
			</div>
		);
	}
}
