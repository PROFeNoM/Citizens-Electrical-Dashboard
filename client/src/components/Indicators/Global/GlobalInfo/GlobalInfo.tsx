import './GlobalInfo.css';

import React from 'react';

import { ConsumerProfile, ProducerProfile } from 'constants/profiles';
import { getZonesNames, getZoneArea, getZoneNbOfBuildings, getZoneNbOfCollectionSites, getZoneNbOfProductionSites } from 'scripts/dbUtils';
import { getTotalConsumption, getTotalProduction } from 'scripts/api';
import { wattsToMegawatts } from 'scripts/utils';

interface Props {
	zoneName: string; // Name of the selected zone
	consumerProfile: ConsumerProfile; // Selected consumerProfile
	t1: number; // Start time of the current period (Unix milliseconds) // Start time
	t2: number; // End time of the current period (Unix milliseconds) // End time
}

interface State {
	area: number; // Area of the selected zone
	nbOfBuildings: number; // Number of buildings in the selected zone
	nbOfCollectionSites: number; // Number of consumption sites in the selected zone for the given consumer profile
	nbOfProductionSites: number; // Number of production sites in the selected zone
	consumption: number; // Total consumption of the selected zone for the given consumer profile and time period
	production: number; // Total production of the selected zone for the given time period
}

/**
 * Textual indicator that displays general informations about a zone.
 * 
 * Informations displayed :
 * - Area of the zone (m²)
 * - Number of buildings in the zone
 * - Number of consumptions points in the zone for the given consumer profile
 * - Consumption of the zone in the given time for the given consumer profile (MWh)
 * - Production of the zone in the given time (MWh)
 * - Ratio between the total consumption and the total production of the zone
 */
export default class GlobalInfo extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			area: null,
			nbOfBuildings: null,
			nbOfCollectionSites: null,
			nbOfProductionSites: null,
			consumption: null,
			production: null
		};
	}

	private async fetchData() {
		const { zoneName, consumerProfile, t1, t2 } = this.props;
		const zoneNames = await getZonesNames();

		const area = zoneName === null ?
			(await Promise.all(zoneNames.map(getZoneArea))).reduce((a, b) => a + b)
			: await getZoneArea(zoneName);

		const nbOfBuildings = zoneName === null ?
			(await Promise.all(zoneNames.map(getZoneNbOfBuildings))).reduce((a, b) => a + b)
			: await getZoneNbOfBuildings(zoneName);

		const nbOfCollectionSites = zoneName === null ?
			(await Promise.all(zoneNames.map(zone => getZoneNbOfCollectionSites(zone, consumerProfile)))).reduce((a, b) => a + b)
			: await getZoneNbOfCollectionSites(zoneName, consumerProfile);

		const nbOfProductionSites = zoneName === null ?
			(await Promise.all(zoneNames.map(zone => getZoneNbOfProductionSites(zone, ProducerProfile.SOLAR)))).reduce((a, b) => a + b)
			: await getZoneNbOfProductionSites(zoneName, ProducerProfile.SOLAR);

		this.setState({
			area,
			nbOfBuildings,
			nbOfCollectionSites,
			nbOfProductionSites
		});

		const [consumption, production] = await Promise.all([
			getTotalConsumption(t1, t2, [consumerProfile], zoneName),
			getTotalProduction(t1, t2, undefined, zoneName)
		]);

		this.setState({
			consumption,
			production
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
		if (prevProps.zoneName === this.props.zoneName && prevProps.consumerProfile === this.props.consumerProfile && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
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
		const { consumerProfile } = this.props;
		const { area, nbOfBuildings, nbOfCollectionSites, nbOfProductionSites, consumption, production } = this.state;
		const consumptionMegaWatts = consumption !== null ?
			wattsToMegawatts(consumption)
			: null;
		const productionMegaWatts = production !== null ?
			wattsToMegawatts(production)
			: null;
		const ratio = consumption !== null && production !== null ?
			consumption === 0 ?
				0
				: production / consumption * 100
			: null;

		let consumptionSectorText: string;
		switch (consumerProfile) {
			case ConsumerProfile.RESIDENTIAL:
				consumptionSectorText = 'résidentiel';
				break;
			case ConsumerProfile.PROFESSIONAL:
				consumptionSectorText = 'professionnel';
				break;
			case ConsumerProfile.TERTIARY:
				consumptionSectorText = 'tertiaire';
				break;
			case ConsumerProfile.PUBLIC_LIGHTING:
				consumptionSectorText = 'd\'éclairage publique';
				break;
			case ConsumerProfile.ALL:
			default:
				consumptionSectorText = 'au total';
		}

		const productionSectorText: string = 'solaire';

		const intFormatter = Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 0 });
		const floatFormatter = Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 2 });
		function format(value: number | null, formatter: Intl.NumberFormat): string {
			return value === null ?
				'...'
				: formatter.format(value);
		}

		return (
			<div id="global-info" className="text-indicator">
				<ul>
					<li><span className="data">{format(area, intFormatter)}</span> m²</li>
					<li><span className="data">{format(nbOfBuildings, intFormatter)}</span> bâtiment{nbOfBuildings > 1 ? 's' : ''} au total</li>
					<li><span className="data">{format(nbOfCollectionSites, intFormatter)}</span> point{nbOfCollectionSites > 1 ? 's' : ''} de consommation {consumptionSectorText}</li>
					<li><span className="data">{format(consumptionMegaWatts, floatFormatter)}</span> MWh d'électricité consommée</li>
					<li><span className="data">{format(nbOfProductionSites, intFormatter)}</span> point{nbOfProductionSites > 1 ? 's' : ''} de production {productionSectorText}</li>
					<li><span className="data">{format(productionMegaWatts, floatFormatter)}</span> MWh d'électricité produite</li>
					<li><span className="data">{format(ratio, floatFormatter)}</span> % de ratio production/consommation</li>
				</ul>
			</div>
		);
	}
}
