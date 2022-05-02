import './LocalProductionInfo.css';

import React from 'react';

import { ProducerProfile } from 'constants/profiles';
import { getTotalProduction } from 'scripts/api';
import { zonesGeoJSON } from 'geodata';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
}

interface State {
	productionPoints: number;
	totalProduction: number;
	// TODO: most/least productive days
	//bestDay: Date;
	//worstDay: Date;
}

export default class LocalProductionInfo extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			productionPoints: 0,
			totalProduction: 0,
			//bestDay: new Date(),
			//worstDay: new Date()
		};
	}

	async fetchData() {
		const { t1, t2, urbanZone } = this.props;
		// Retreive the number of production points using geodata zones
		const zone = zonesGeoJSON.features.find(z => z.properties.libelle === urbanZone).properties.PROD_F5;
		const totalProduction = await getTotalProduction(t1, t2, [ProducerProfile.SOLAR], urbanZone);
		//const bestDay = await getBestDay(t1, t2, [ProducerProfile.SOLAR], urbanZone);
		//const worstDay = await getWorstDay(t1, t2, [ProducerProfile.SOLAR], urbanZone);
		this.setState({
			productionPoints: zone,
			totalProduction: totalProduction,
			//bestDay: bestDay,
			//worstDay: worstDay
		});
	}

	async componentDidMount() {
		// TODO: check, often error here
		await this.fetchData();
	}

	/*async componentDidUpdate() {
		await this.fetchData();
	}*/

	render() {
		const plural: boolean = this.state.productionPoints > 1;
		const district: boolean = this.props.urbanZone === null;

		return (
			<div id="local-production-info" className="text-indicator">
				<p>
					La production d'énergie solaire {plural ? 'des ' : ''}{plural ? <strong>{this.state.productionPoints} points</strong> : 'du point'} de production {district ? 'du quartier' : 'de la zone'} <strong>{district ? 'Bastide' : this.props.urbanZone}</strong> s'élève à <strong>{new Intl.NumberFormat().format(this.state.totalProduction)}&nbsp;kWh</strong>.
				</p>
				<p>
					Cette production a permis d'éviter l'émission de <strong>{Math.round(29 * this.state.totalProduction / 1000 / 1000 / 1000)}&nbsp;kilotonnes</strong> de CO2 lors de cette période.
				</p>
			</div>
		);
	}
}
