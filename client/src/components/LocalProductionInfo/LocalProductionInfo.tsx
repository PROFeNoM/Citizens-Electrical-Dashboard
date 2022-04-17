import './LocalProductionInfo.css';
import React from 'react';
import {getTotalProduction, ProducerProfile} from "../../scripts/api";
import {zones} from "../../geodata";

interface Props {
	t1: number,
	t2: number;
	urbanZone: string;
	title: string;
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

	async fetchData(){
		const { t1, t2, urbanZone } = this.props;
		// Retrive the number of production points using geodata zones
		const zone = zones.features.find(z => z.properties.libelle === urbanZone).properties.PROD_F5;
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
		await this.fetchData();
	}

	/*async componentDidUpdate() {
		await this.fetchData();
	}*/

	render() {
		const plural: boolean = this.state.productionPoints > 1;
		return (
			<div className="typical-c-day-wrapper">
				<div className="typical-c-day-title-wrapper">{this.props.title}</div>
				<div className="local-production-info-text-wrapper">
					<p className="local-production-paragraph">La production d'énergie solaire {plural ? 'des' : 'du'} <b className='local-production-bold'>{this.state.productionPoints}</b> {plural ? 'points' : 'point'} de production de <b className='local-production-bold'>{this.props.urbanZone}</b> s'élève à <b className='local-production-bold'>{new Intl.NumberFormat().format(this.state.totalProduction)} kWh</b></p>
					<p>Cette production a permis d'éviter l'émission de <b className='local-production-bold'>{Math.round(29 * this.state.totalProduction / 1000 / 1000 / 1000) }</b> kilotonnes de CO2 cette période</p>
				</div>
			</div>
		);
	}
}
