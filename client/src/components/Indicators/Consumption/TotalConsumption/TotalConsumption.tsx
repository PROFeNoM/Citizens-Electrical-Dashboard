import './TotalConsumption.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ConsumerProfile } from 'constants/profiles';
import { getTotalConsumption } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';

interface Props {
	zoneName: string;
	t1: number;
	t2: number;
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
			{ label: "Total", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2))) },
			{ label: "Residentiels", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL]))) },
			{ label: "Tertiaires", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY]))) },
			{ label: "Professionnels", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL]))) },
			{ label: "Eclairage", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING]))) },
		]);
	}

	private async getUrbanZoneConsumptionData(): Promise<{ label: string, y: number }[]> {
		return Promise.all([
			{ label: "Total", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, undefined, this.props.zoneName))) },
			{ label: "Residentiels", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.RESIDENTIAL], this.props.zoneName))) },
			{ label: "Tertiaires", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.TERTIARY], this.props.zoneName))) },
			{ label: "Professionnels", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PROFESSIONAL], this.props.zoneName))) },
			{ label: "Eclairage", y: Math.round(wattsToKilowatts(await getTotalConsumption(this.props.t1, this.props.t2, [ConsumerProfile.PUBLIC_LIGHTING], this.props.zoneName))) },
		]);
	}

	private async fetchData(): Promise<void> {
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
		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.zoneName === this.props.zoneName && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
			return;
		}

		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
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
			toolTip: {
				shared: true
			},
			data: [
				{
					type: 'column',
					name: 'Consommation de La Bastide (kWh)',
					axisYType: 'primary',
					dataPoints: districtConsumptionData,
					color: '#688199'
				},
				{
					type: 'column',
					name: 'Consommation de la zone urbaine (kWh)',
					axisYType: 'primary',
					dataPoints: urbanZoneConsumptionData,
					color: '#e63b11'
				}
			],
			subtitles: []
		}

		const totalConsumption = districtConsumptionData.find(d => d.label === "Total");
		if (totalConsumption && totalConsumption.y === 0) {
			chartOptions.subtitles = [{
				text: 'Pas de données pour la période',
				verticalAlign: 'center',
				fontSize: 24,
				fontFamily: 'Ubuntu'
			}];
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
