import './LocalProductionInfo.css';

import React from 'react';

import { ProducerProfile } from 'constants/profiles';
import { getTotalProduction } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';
import { getZoneNbOfProductionSites } from 'scripts/dbUtils';

interface Props {
	zoneName: string;
	t1: number;
	t2: number;
}

interface State {
	productionPoints: number;
	totalProduction: number;
}

export default class LocalProductionInfo extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			productionPoints: 0,
			totalProduction: 0
		};
	}

	async fetchData() {
		const { t1, t2, zoneName } = this.props;
		const productionPoints = getZoneNbOfProductionSites(zoneName, ProducerProfile.SOLAR);
		const totalProduction = await getTotalProduction(t1, t2, [ProducerProfile.SOLAR], zoneName);
		this.setState({
			productionPoints,
			totalProduction
		});
		console.log(`${zoneName} production points: ${productionPoints}`);
	}

	async componentDidMount() {
		// TODO: check, often error here
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
		const CO2avoided = formatter.format(totalProduction * 0.0025);

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
					La production d'énergie eléctrique {productionPoints > 1 ? 'des ' : ''}{productionPoints > 1 ? <strong>{productionPoints} points</strong> : 'du point'} de production solaire {district ? 'du quartier' : 'de la zone'} <strong>{district ? 'Bastide' : this.props.zoneName}</strong> s'élève à <strong>{totalProductionKilowatts}&nbsp;kWh</strong>.
				</p>
				<p>
					Cette production a permis d'éviter l'émission de <strong>{CO2avoided}&nbsp;kilotonnes</strong> de CO2 lors de cette période.
				</p>
			</div>
		);
	}
}
