import './TotalConsumption.css';
import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';
import { ConsumerProfile, getTotalConsumption } from 'scripts/api';

interface Props {
	t1: number,
	t2: number,
	urbanZone: string,
	title: string,
	setHighlightedZone: (val: string | null) => void
}

interface State {
	districtConsumptionData: { label: string, y: number }[],
	urbanZoneConsumptionData: { label: string, y: number }[]
}

export default class TotalConsumption extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			districtConsumptionData: [],
			urbanZoneConsumptionData: []
		};
	}

	private async getDistrictConsumptionData() {
		return [
			{ label: "Total", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2) / 1000) },
			{ label: "Residentiels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL]) / 1000) },
			{ label: "Tertiaires", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY]) / 1000) },
			{ label: "Professionnels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL]) / 1000) },
			{ label: "Eclairage", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING]) / 1000) },
		];
	}

	private async getUrbanZoneConsumptionData() {

		return [
			{ label: "Total", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, undefined, this.props.urbanZone) / 1000) },
			{ label: "Residentiels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL], this.props.urbanZone) / 1000) },
			{ label: "Tertiaires", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY], this.props.urbanZone) / 1000) },
			{ label: "Professionnels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL], this.props.urbanZone) / 1000) },
			{ label: "Eclairage", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING], this.props.urbanZone) / 1000) },
		];
	}

	async fetchData() {
		const districtConsumptionData = await this.getDistrictConsumptionData();
		const urbanZoneConsumptionData = await this.getUrbanZoneConsumptionData();
		this.setState({
			districtConsumptionData: districtConsumptionData,
			urbanZoneConsumptionData: urbanZoneConsumptionData
		});
	}

	async componentDidMount() {
		await this.fetchData();
	}

	private onClick = () => {
		this.props.setHighlightedZone(this.props.urbanZone);
	}

	render() {
		const chartOptions = {
			exportEnabled: true,
			animationEnabled: true,
			axisX: {
				fontFamily: 'Ubuntu',
				title: 'Filière',
				titleFontWeight: 'bold'
			},
			axisY: {
				fontFamily: 'Ubuntu',
				title: 'kWh',
				titleFontWeight: 'bold',
				logarithmic: false
			},
			axisY2: {
				lineColor: '#93c90e',
				labelFontColor: '#93c90e',
				tickColor: '#93c90e',
				fontFamily: 'Ubuntu'
			},
			toolTip: {
				shared: true
			},
			data: [{
				type: 'column',
				name: 'Consommation de La Bastide (kWh)',
				axisYType: 'primary',
				dataPoints: this.state.districtConsumptionData,
				color: '#688199',
				click: this.onClick
			}, {
				type: 'column',
				name: 'Consommation de la zone urbaine (kWh)',
				axisYType: 'primary',
				dataPoints: this.state.urbanZoneConsumptionData,
				color: '#e63b11',
				click: this.onClick
			}]
		}

		return (
			<div id="total-consumption" className="graph-indicator">
				<div id="total-consumption-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div id="total-consumption-legend" className="graph-legend">
					<div id="total-consumption-legend-urban-zone" className="graph-legend-item">
						<div id="total-consumption-legend-urban-zone-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation par filière dans la zone urbaine
						</p>
					</div>
					<div id="total-consumption-legend-district" className="graph-legend-item">
						<div id="total-consumption-legend-district-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation par filière dans le quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
