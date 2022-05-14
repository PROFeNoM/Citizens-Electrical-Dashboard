import './TypicalProductionDay.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ProducerProfile } from 'constants/profiles';
import { getHourlyMeanProduction } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';

interface Props {
	zoneName: string; // The name of the current zone
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
}

interface State {
	districtProductionData: { x: Date; y: number }[]; // Production data for the district
	zoneProductionData: { x: Date; y: number }[]; // Production data for the zone
}

/**
 * Graphical indicator (bar chart) that displays
 * the production during an average day, in kWh.
 */
export default class TypicalProductionDay extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		// Temporary points to display during loading
		const tmpPoints = Array.from(Array(24).keys())
			.map((h) => {
				return {
					x: new Date(Date.UTC(2022, 1, 1, h, 0)),
					y: 42,
				};
			});

		this.state = {
			districtProductionData: tmpPoints,
			zoneProductionData: tmpPoints
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
				y: Math.round(wattsToKilowatts(el.hour.getHours() <= 5 || el.hour.getHours() >= 23 ? 0 : el.mean)),
			};
		});
	}

	private async getUrbanZoneProductionData() {
		const meanCons = await getHourlyMeanProduction(
			this.props.t1,
			this.props.t2,
			[ProducerProfile.SOLAR],
			this.props.zoneName
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(wattsToKilowatts(el.hour.getHours() <= 5 || el.hour.getHours() >= 23 ? 0 : el.mean)),
			};
		});
	}

	private async fetchData() {
		const districtProductionData = await this.getDistrictProductionData();
		const zoneProductionData = await this.getUrbanZoneProductionData();
		this.setState({
			districtProductionData: districtProductionData,
			zoneProductionData: zoneProductionData,
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
		const { districtProductionData, zoneProductionData } = this.state;

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
					dataPoints: districtProductionData,
					color: "#688199"
				},
				{
					type: "column",
					name: "Production de la zone urbaine (Wh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: zoneProductionData,
					color: "#e63b11"
				},
			],
			subtitles: []
		};

		if (districtProductionData.reduce((acc, cur) => acc + cur.y, 0) === 0 && zoneProductionData.reduce((acc, cur) => acc + cur.y, 0) === 0) {
			chartOptions.subtitles = [{
				text: 'Pas de données pour la période',
				verticalAlign: 'center',
				fontSize: 15,
				fontFamily: 'Ubuntu'
			}];
		}

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
