import './TotalConsumption.css';
import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';
import { ConsumerProfile, getTotalConsumption } from 'scripts/api';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	setHighlightedZone: (val: string | null) => void;
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

	private async getDistrictConsumptionData(): Promise<{ label: string, y: number }[]> {
		return Promise.all([
			{ label: "Total", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2) / 1000) },
			{ label: "Residentiels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL]) / 1000) },
			{ label: "Tertiaires", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY]) / 1000) },
			{ label: "Professionnels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL]) / 1000) },
			{ label: "Eclairage", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING]) / 1000) },
		]);
	}

	private async getUrbanZoneConsumptionData(): Promise<{ label: string, y: number }[]> {
		return Promise.all([
			{ label: "Total", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, undefined, this.props.urbanZone) / 1000) },
			{ label: "Residentiels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL], this.props.urbanZone) / 1000) },
			{ label: "Tertiaires", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY], this.props.urbanZone) / 1000) },
			{ label: "Professionnels", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL], this.props.urbanZone) / 1000) },
			{ label: "Eclairage", y: Math.round(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING], this.props.urbanZone) / 1000) },
		]);
	}

	async fetchData(): Promise<void> {
		Promise.all([
			this.getDistrictConsumptionData(),
			this.getUrbanZoneConsumptionData()
		]).then(([districtConsumptionData, urbanZoneConsumptionData]) => {
			this.setState({
				districtConsumptionData,
				urbanZoneConsumptionData
			});
		});
	}

	async componentDidMount() {
		await this.fetchData();
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.t1 !== this.props.t1 || prevProps.t2 !== this.props.t2 || prevProps.urbanZone !== this.props.urbanZone) {
			await this.fetchData();
		}
	}

	private onClick = () => {
		this.props.setHighlightedZone(this.props.urbanZone);
	}

	render() {
		const { districtConsumptionData, urbanZoneConsumptionData } = this.state;

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
				dataPoints: districtConsumptionData,
				color: '#688199',
				click: this.onClick
			}, {
				type: 'column',
				name: 'Consommation de la zone urbaine (kWh)',
				axisYType: 'primary',
				dataPoints: urbanZoneConsumptionData,
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
