import './ProductionInfo.css';

import React from 'react';

import { ProducerProfile } from 'constants/profiles';
import { getTotalProduction } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';
import { getZoneNbOfProductionSites, getZonesNames } from 'scripts/dbUtils';

interface Props {
	zoneName: string; // Name of the current zone
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
}

interface State {
	productionPoints: number; // Production points for the zone
	totalProduction: number; // Total production of the zone (kWh)
}

/**
 * Textual indicator that displays the number of production points in the zone,
 * the total consumption in the zone in kWh and the equivalent in CO2.
 */
export default class ProductionInfo extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			productionPoints: null,
			totalProduction: null
		};
	}

	private async fetchData() {
		const { t1, t2, zoneName } = this.props;
		const zoneNames = await getZonesNames();

		const productionPoints = zoneName === null ?
			(await Promise.all(zoneNames.map(zone => getZoneNbOfProductionSites(zone, ProducerProfile.SOLAR)))).reduce((a, b) => a + b)
			: await getZoneNbOfProductionSites(zoneName, ProducerProfile.SOLAR);
		const totalProduction = await getTotalProduction(t1, t2, [ProducerProfile.SOLAR], zoneName);
		this.setState({
			productionPoints,
			totalProduction
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
		const { productionPoints, totalProduction } = this.state;
		const district: boolean = zoneName === null;
		const formatter = new Intl.NumberFormat('fr-FR', { style: 'decimal', maximumFractionDigits: 2 });

		const totalProductionKilowatts = formatter.format(wattsToKilowatts(totalProduction));
		// Source of the formula: https://www.greenit.fr/2009/04/24/combien-de-co2-degage-un-1-kwh-electrique/
		const kgsOfCO2avoided = formatter.format(wattsToKilowatts(totalProduction) * 0.1);

		if (productionPoints === null || totalProduction === null) {
			return (
				<div id="local-production-info" className="text-indicator">
					<p>
						Chargement...
					</p>
				</div>
			);
		}

		if (productionPoints === 0) {
			return (
				<div id="local-production-info" className="text-indicator">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : zoneName}</strong> n'a pas de points de production solaire.
					</p>
				</div>
			);
		}

		if (totalProduction === 0) {
			return (
				<div id="local-production-info" className="text-indicator">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : zoneName}</strong> possède {productionPoints > 1 ? <strong>{productionPoints} points</strong> : 'un point'} de production solaire.
					</p>
					<p>
						Il n'y a pas de production électrique pendant la période.
					</p>
				</div>
			);
		}

		return (
			<div id="local-production-info" className="text-indicator">
				<p>
					La production d'énergie électrique {productionPoints > 1 ? 'des ' : ''}{productionPoints > 1 ? <strong>{productionPoints} points</strong> : 'du point'} de production solaire {district ? 'du quartier' : 'de la zone'} <strong>{district ? 'Bastide' : this.props.zoneName}</strong> s'élève à <strong>{totalProductionKilowatts}&nbsp;kWh</strong> sur la période.
				</p>
				<p>
					Cette production a permis d'éviter l'émission de <strong>{kgsOfCO2avoided}&nbsp;kg</strong> de CO2 lors de cette période.
				</p>
			</div>
		);
	}
}
