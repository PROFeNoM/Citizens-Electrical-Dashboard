import './TypicalProductionDay.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ProducerProfile } from 'constants/profiles';
import { getHourlyMeanProduction } from 'scripts/api';

const tmpPoints = Array.from(Array(24).keys()).map((h) => {
	return {
		x: new Date(Date.UTC(2022, 1, 1, h, 0)),
		y: 42,
	};
});

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	districtConsumptionData: { x: Date; y: number }[];
	urbanZoneConsumptionData: { x: Date; y: number }[];
}

export default class TypicalProductionDay extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			districtConsumptionData: tmpPoints,
			urbanZoneConsumptionData: tmpPoints,
		};
	}

	private async getDistrictProductionData() {
		const meanCons = await getHourlyMeanProduction(
			this.props.t1,
			this.props.t2,
			[ProducerProfile.SOLAR],
			undefined,
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(el.hour.getHours() <= 5 || el.hour.getHours() >= 23 ? 0 : el.mean),
			};
		});
	}

	private async getUrbanZoneProductionData() {
		const meanCons = await getHourlyMeanProduction(
			this.props.t1,
			this.props.t2,
			[ProducerProfile.SOLAR],
			this.props.urbanZone
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(el.hour.getHours() <= 5 || el.hour.getHours() >= 23 ? 0 : el.mean),
			};
		});
	}

	async fetchData() {
		const districtConsumptionData = await this.getDistrictProductionData();
		const urbanZoneConsumptionData = await this.getUrbanZoneProductionData();
		this.setState({
			districtConsumptionData: districtConsumptionData,
			urbanZoneConsumptionData: urbanZoneConsumptionData,
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
				valueFormatString: "HH:mm",
				fontFamily: "Ubuntu",
			},
			axisY: {
				fontFamily: "Ubuntu",
				title: "Wh",
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
					name: "Production de La Bastide (Wh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: this.state.districtConsumptionData,
					color: "#688199",
					click: this.onClick
				},
				{
					type: "column",
					name: "Production de la zone urbaine (Wh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: this.state.urbanZoneConsumptionData,
					color: "#e63b11",
					click: this.onClick
				},
			],
		};

		return (
			<div id="typical-p-day" className="graph-indicator">
				<div id="typical-p-day-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div id="typical-p-day-legend" className="graph-legend">
					<div id="typical-p-day-legend-urban-zone" className="graph-legend-item">
						<div id="typical-p-day-legend-urban-zone-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Production moyenne de la zone urbaine
						</p>
					</div>
					<div id="typical-p-day-legend-district" className="graph-legend-item">
						<div id="typical-p-day-legend-district-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Production moyenne du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
