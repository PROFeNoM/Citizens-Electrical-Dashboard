import './TypicalProductionDay.css';
import React from 'react';
import {CanvasJSChart} from 'canvasjs-react-charts';
import {getHourlyMeanProduction, ProducerProfile,} from '../../scripts/api';

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
	title: string;
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
				y: Math.round(el.mean / 1000),
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
				y: Math.round(el.mean / 1000),
			};
		});
	}

	async fetchData(){
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

	/*async componentDidUpdate() {
		await this.fetchData();
	}*/

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
					name: "Production de La Bastide (kWh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: this.state.districtConsumptionData,
					color: "#688199",
				},
				{
					type: "column",
					name: "Production de la zone urbaine (kWh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: this.state.urbanZoneConsumptionData,
					color: "#e63b11",
				},
			],
		};

		return (
			<div className="typical-c-day-wrapper">
				<div className="typical-c-day-title-wrapper">{this.props.title}</div>
				<div className="typical-consumption-day-graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div className="typical-c-day-legend-wrapper">
					<div className="typical-c-day-urbanZone-legend-wrapper">
						<div className="typical-c-day-urbanZone-color" />
						<p className="typical-c-day-urbanZone-text">
							Production moyenne de la zone urbaine
						</p>
					</div>
					<div className="typical-c-day-district-legend-wrapper">
						<div className="typical-c-day-district-color" />
						<p className="typical-c-day-district-text">
							Production moyenne du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
