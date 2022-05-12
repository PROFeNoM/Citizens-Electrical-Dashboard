import './ConsumptionInfo.css';

import React from 'react';

import { ConsumerProfile } from 'constants/profiles';
import { getTotalConsumption } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';
import { getZoneNbOfCollectionSites, getZonesNames } from 'scripts/dbUtils';

interface Props {
	zoneName: string;
	sector: ConsumerProfile;
	t1: number;
	t2: number;
}

interface State {
	consumptionPoints: number;
	totalConsumption: number;
}

export default class ConsumptionInfo extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			consumptionPoints: null,
			totalConsumption: null
		};
	}

	private async fetchData() {
		const { zoneName, sector, t1, t2 } = this.props;
		const zoneNames = await getZonesNames();

		const consumptionPoints = zoneName === null ?
			(await Promise.all(zoneNames.map(zone => getZoneNbOfCollectionSites(zone, sector)))).reduce((a, b) => a + b)
			: await getZoneNbOfCollectionSites(zoneName, sector);
		const totalConsumption = await getTotalConsumption(t1, t2, [sector], zoneName);

		this.setState({
			consumptionPoints,
			totalConsumption
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
		if (prevProps.zoneName === this.props.zoneName && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
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
		const { zoneName } = this.props;
		const { consumptionPoints, totalConsumption } = this.state;
		const district: boolean = zoneName === null;
		const formatter = new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 2 });

		const totalConsumptionKilowatts = formatter.format(wattsToKilowatts(totalConsumption));
		// Source of the formula: https://www.greenit.fr/2009/04/24/combien-de-co2-degage-un-1-kwh-electrique/
		const kgsOfCO2 = formatter.format(wattsToKilowatts(totalConsumption) * 0.1);

		if (consumptionPoints === null || totalConsumption === null) {
			return (
				<div id="local-consumption-info" className="text-indicator">
					<p>
						Chargement...
					</p>
				</div>
			);
		}

		if (consumptionPoints === 0) {
			return (
				<div id="local-consumption-info" className="text-indicator">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : zoneName}</strong> n'a pas de points de consumption solaire.
					</p>
				</div>
			);
		}

		if (totalConsumption === 0) {
			return (
				<div id="local-consumption-info" className="text-indicator">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : zoneName}</strong> possède {consumptionPoints > 1 ? <strong>{consumptionPoints} points</strong> : 'un point'} de consumption solaire.
					</p>
					<p>
						Il n'y a pas de consommation électrique pendant la période.
					</p>
				</div>
			);
		}

		return (
			<div id="local-consumption-info" className="text-indicator">
				<p>
					La consommation d'énergie électrique {consumptionPoints > 1 ? 'des ' : ''}{consumptionPoints > 1 ? <strong>{consumptionPoints} points</strong> : 'du point'} de consommation {district ? 'du quartier' : 'de la zone'} <strong>{district ? 'Bastide' : this.props.zoneName}</strong> s'élève à <strong>{totalConsumptionKilowatts}&nbsp;kWh</strong> sur la période.
				</p>
				<p>
					Cette consommation représente l'équivalent de <strong>{kgsOfCO2}&nbsp;kg</strong> de CO2.
				</p>
			</div>
		);
	}
}
