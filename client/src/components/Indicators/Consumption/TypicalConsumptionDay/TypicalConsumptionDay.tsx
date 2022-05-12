import './TypicalConsumptionDay.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ConsumerProfile } from 'constants/profiles';
import { getHourlyMeanConsumption, getHourlyMeanProduction } from 'scripts/api';

const tmpPoints = Array.from(Array(24).keys()).map((h) => {
	return {
		x: new Date(Date.UTC(2022, 1, 1, h, 0)),
		y: 42,
	};
});

interface Props {
	zoneName: string;
	buildingType: ConsumerProfile;
	t1: number;
	t2: number;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	districtConsumptionData: { x: Date; y: number }[];
	urbanZoneConsumptionData: { x: Date; y: number }[];
}

export default class TypicalConsumptionDay extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			districtConsumptionData: tmpPoints,
			urbanZoneConsumptionData: tmpPoints
		};
	}

	private async getSelfConsumptionData() {
		const meanCons = await getHourlyMeanConsumption(
			this.props.t1,
			this.props.t2,
			this.props.buildingType ? [this.props.buildingType] : undefined,
			this.props.zoneName
		);
		const meanProd = await getHourlyMeanProduction(
			this.props.t1,
			this.props.t2,
			undefined,
			this.props.zoneName
		);

		return meanCons.map((el, index) => {
			return {
				x: el.hour,
				y: Math.round((meanProd[index].mean / el.mean) * 100) / 100,
			};
		});
	}

	private async getDistrictConsumptionData() {
		const meanCons = await getHourlyMeanConsumption(
			this.props.t1,
			this.props.t2,
			this.props.buildingType ? [this.props.buildingType] : undefined,
			undefined,
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(el.mean / 1000),
			};
		});
	}

	private async getUrbanZoneConsumptionData() {
		const meanCons = await getHourlyMeanConsumption(
			this.props.t1,
			this.props.t2,
			this.props.buildingType ? [this.props.buildingType] : undefined,
			this.props.zoneName
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(el.mean / 1000),
			};
		});
	}

	private async fetchData() {
		const districtConsumptionData = await this.getDistrictConsumptionData();
		const urbanZoneConsumptionData = await this.getUrbanZoneConsumptionData();

		this.setState({
			districtConsumptionData: districtConsumptionData,
			urbanZoneConsumptionData: urbanZoneConsumptionData,
		});
	}

	async componentDidMount() {
		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	private onClick() {
		this.props.setHighlightedZone(this.props.zoneName);
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.zoneName === this.props.zoneName && prevProps.buildingType === this.props.buildingType && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
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
				valueFormatString: "HH:mm",
				fontFamily: "Ubuntu",
			},
			axisY: {
				fontFamily: "Ubuntu",
				title: "kWh",
				titleFontWeight: "bold",
			},
			axisY2: {
				lineColor: "#93c90e",
				labelFontColor: "#93c90e",
				tickColor: "#93c90e",
				fontFamily: "Ubuntu",
			},
			toolTip: {
				shared: true,
			},
			data: [
				{
					type: "column",
					name: "Consommation de La Bastide (kWh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: districtConsumptionData,
					color: "#688199",
					click: this.onClick
				},
				{
					type: "column",
					name: "Consommation de la zone urbaine (kWh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: urbanZoneConsumptionData,
					color: "#e63b11",
					click: this.onClick
				}
			],
			subtitles: []
		};

		if (districtConsumptionData.reduce((acc, cur) => acc + cur.y, 0) === 0 && urbanZoneConsumptionData.reduce((acc, cur) => acc + cur.y, 0) === 0) {
			chartOptions.subtitles = [{
				text: 'Pas de données pour la période',
				verticalAlign: 'center',
				fontSize: 15,
				fontFamily: 'Ubuntu'
			}];
		}

		return (
			<div id="typical-c-day" className="graph-indicator">
				<div id="typical-c-day-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div id="typical-c-day-legend" className="graph-legend">
					<div id="typical-c-day-legend-urban-zone" className="graph-legend-item">
						<div id="typical-c-day-legend-urban-zone-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation moyenne de la zone urbaine
						</p>
					</div>
					<div id="typical-c-day-legend-district" className="graph-legend-item">
						<div id="typical-c-day-legend-district-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation moyenne du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
