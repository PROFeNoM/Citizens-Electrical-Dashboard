import './EnergyBalance.css';

import React from 'react';

import { ConsumerProfile } from 'constants/profiles';
import { getZonesNames, getZoneArea, getZoneNbOfBuildings, getZoneNbOfCollectionSites } from 'scripts/dbUtils';
import { getTotalConsumption, getTotalProduction } from 'scripts/api';
import { wattsToMegawatts } from 'scripts/utils';

interface Props {
	zoneName: string; // Name of the selected zone
	sector: ConsumerProfile; // Selected sector
	t1: number; // Start time
	t2: number; // End time
}

interface State {
	area: number; // Area of the selected zone
	nbOfBuildings: number; // Number of buildings in the selected zone
	nbOfConsumers: number; // Number of consumers in the selected zone for the given sector
	consumption: number; // Total consumption of the selected zone for the given sector and time period
	production: number; // Total production of the selected zone for the given time period
}

/**
 * Textual indicator that displays general informations about a zone.
 * - The area of the zone (m²)
 * - The number of buildings in the zone
 * - The number of consumptions points in the zone for the given sector
 * - The consumption of the zone in the given time for the given sector (MWh)
 * - The production of the zone in the given time (MWh)
 * - The ratio between the total consumption and the total production of the zone
 */
export default class EnergyBalance extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			area: null,
			nbOfBuildings: null,
			nbOfConsumers: null,
			consumption: null,
			production: null
		};
	}

	/**
	 * Fetch the data for the current zone and update the state.
	 */
	async fetchData() {
		const { zoneName, sector, t1, t2 } = this.props;
		const zoneNames = await getZonesNames();

		const area = zoneName === null ?
			(await Promise.all(zoneNames.map(getZoneArea))).reduce((a, b) => a + b)
			: await getZoneArea(zoneName);

		const nbOfBuildings = zoneName === null ?
			(await Promise.all(zoneNames.map(getZoneNbOfBuildings))).reduce((a, b) => a + b)
			: await getZoneNbOfBuildings(zoneName);

		const nbOfConsumers = zoneName === null ?
			(await Promise.all(zoneNames.map(zone => getZoneNbOfCollectionSites(zone, sector)))).reduce((a, b) => a + b)
			: await getZoneNbOfCollectionSites(zoneName, sector);

		this.setState({
			area,
			nbOfBuildings,
			nbOfConsumers
		});

		const [consumption, production] = await Promise.all([
			getTotalConsumption(t1, t2, [sector], zoneName),
			getTotalProduction(t1, t2, undefined, zoneName),
		]);

		this.setState({
			consumption,
			production
		});
	}

	/**
	 * Update the state initially when the component is mounted.
	 */
	async componentDidMount() {
		try {
			await this.fetchData();
		}
		catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	/**
	 * Update the state only if the props have changed.
	 * 
	 * @param prevProps Previous props
	 */
	async componentDidUpdate(prevProps: Props) {
		if (prevProps.zoneName === this.props.zoneName && prevProps.sector === this.props.sector && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
			return;
		}

		try {
			await this.fetchData();
		}
		catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	render() {
		const { sector } = this.props;
		const { area, nbOfBuildings, nbOfConsumers, consumption, production } = this.state;
		const formatter = new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 2 });
		const consumptionMegaWatts = consumption !== null ?
			formatter.format(wattsToMegawatts(consumption))
			: null;
		const productionMegaWatts = production !== null ?
			formatter.format(wattsToMegawatts(production))
			: null;
		const ratio = consumption !== null && production !== null ?
			consumption === 0 ?
				0
				: formatter.format(production / consumption * 100)
			: null;

		let sectorText: string;
		switch (sector) {
			case ConsumerProfile.RESIDENTIAL:
				sectorText = 'résidentiels';
				break;
			case ConsumerProfile.PROFESSIONAL:
				sectorText = 'professionnels';
				break;
			case ConsumerProfile.TERTIARY:
				sectorText = 'tertiaires';
				break;
			case ConsumerProfile.PUBLIC_LIGHTING:
				sectorText = 'd\'éclairage publique';
				break;
			case ConsumerProfile.ALL:
			default:
				sectorText = 'au total';
		}

		return (
			<div id="energy-balance" className="text-indicator">
				<ul>
					<li><span className="data">{Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 }).format(area)}</span> m²</li>
					<li><span className="data">{nbOfBuildings ?? '...'}</span> bâtiment{nbOfBuildings > 1 ? 's' : ''} au total</li>
					<li><span className="data">{nbOfConsumers ?? '...'}</span> point{nbOfConsumers > 1 ? 's' : ''} de consommation {sectorText}</li>
					<li><span className="data">{consumptionMegaWatts ?? '...'}</span> MWh d'électricité consommée</li>
					<li><span className="data">{productionMegaWatts ?? '...'}</span> MWh d'électricité produite</li>
					<li><span className="data">{ratio ?? '...'}</span> % de ratio production/consommation</li>
				</ul>
			</div>
		);
	}
}
