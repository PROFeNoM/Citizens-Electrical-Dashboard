import './TypicalConsumptionDay.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ConsumerProfile } from 'constants/profiles';
import { getHourlyMeanConsumption } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';

interface Props {
	zoneName: string; // Name of the current zone
	consumerProfile: ConsumerProfile; // Current consumer profile
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
}

interface State {
	districtConsumptionData: { x: Date; y: number }[]; // Consumption data for the district
	zoneConsumptionData: { x: Date; y: number }[]; // Consumption data for the zone
}

/**
 * Graphical indicator (bar chart) that displays
 * the consumption during an average day, in kWh.
 */
export default class TypicalConsumptionDay extends React.Component<Props, State> {
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
			districtConsumptionData: tmpPoints,
			zoneConsumptionData: tmpPoints
		};
	}

	private async getDistrictConsumptionData() {
		const meanCons = await getHourlyMeanConsumption(
			this.props.t1,
			this.props.t2,
			this.props.consumerProfile ? [this.props.consumerProfile] : undefined,
			undefined
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(wattsToKilowatts(el.mean))
			};
		});
	}

	private async getzoneConsumptionData() {
		const meanCons = await getHourlyMeanConsumption(
			this.props.t1,
			this.props.t2,
			this.props.consumerProfile ? [this.props.consumerProfile] : undefined,
			this.props.zoneName
		);

		return meanCons.map((el) => {
			return {
				x: el.hour,
				y: Math.round(wattsToKilowatts(el.mean))
			};
		});
	}

	private async fetchData() {
		const districtConsumptionData = await this.getDistrictConsumptionData();
		const zoneConsumptionData = await this.getzoneConsumptionData();

		this.setState({
			districtConsumptionData: districtConsumptionData,
			zoneConsumptionData: zoneConsumptionData
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
		if (prevProps.zoneName === this.props.zoneName && prevProps.consumerProfile === this.props.consumerProfile && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
			return;
		}

		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	render() {
		const { districtConsumptionData, zoneConsumptionData } = this.state;

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
					color: "#688199"
				},
				{
					type: "column",
					name: "Consommation de la zone urbaine (kWh)",
					axisYType: "primary",
					xValueFormatString: "HH:mm",
					dataPoints: zoneConsumptionData,
					color: "#e63b11"
				}
			],
			subtitles: []
		};

		if (districtConsumptionData.reduce((acc, cur) => acc + cur.y, 0) === 0 && zoneConsumptionData.reduce((acc, cur) => acc + cur.y, 0) === 0) {
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
