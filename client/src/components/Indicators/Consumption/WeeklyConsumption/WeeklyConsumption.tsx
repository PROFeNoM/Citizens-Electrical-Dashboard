import './WeeklyConsumption.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { DataType, ConsumerProfile } from 'constants/profiles';
import { getMaxTimestamp, getTotalConsumption } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';

interface Props {
	zoneName: string; // Name of the current zone
	consumerProfile: ConsumerProfile; // Current consumer profile
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
}

interface State {
	districtConsumptionData: { x: Date, y: number }[]; // Consumption data for the district
	zoneConsumptionData: { x: Date, y: number }[]; // Consumption data for the zone
	maxTimestamp: Date; // Maximum timestamp of the data
}


/**
 * Graphical indicator (bar chart) that displays
 * the consumption of the district and the zone each week, in kWh.
 * This indicator allows to see consumption forecasts.
 **/
export default class WeeklyConsumption extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		// Temporary points to display during loading
		const tmpPoints = this.getWeeks().map((week) => {
			return {
				x: new Date(week.start),
				y: 42,
			};
		});

		this.state = {
			districtConsumptionData: tmpPoints,
			zoneConsumptionData: tmpPoints,
			maxTimestamp: new Date()
		};
	}

	// Create a list of start and end week dates that span over the period from t1 to t2
	private getWeeks() {
		const { t1, t2 } = this.props;

		const startDate = new Date(t1);
		const endDate = new Date(t2);
		return Array.from(Array(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))).keys())
			.map((w) => {
				const start = new Date(startDate.getTime() + (w * 7 * 24 * 60 * 60 * 1000));
				const end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
				return {
					start: start.getTime(),
					end: end.getTime(),
				};
			});
	}

	private async getDistrictConsumptionData() {
		const { consumerProfile } = this.props;

		const weeks = this.getWeeks();

		// Determine the total consumption for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalConsumption = await getTotalConsumption(week.start, week.end, [consumerProfile]);
			return {
				x: new Date(week.start),
				y: Math.round(wattsToKilowatts(totalConsumption)),
			};
		}));
	}

	private async getZoneConsumptionData() {
		const { zoneName, consumerProfile } = this.props;

		const weeks = this.getWeeks();

		// Determine the total consumption for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalConsumption = await getTotalConsumption(week.start, week.end, [consumerProfile], zoneName);
			return {
				x: new Date(week.start),
				y: Math.round(wattsToKilowatts(totalConsumption)),
			};
		}));
	}

	private async fetchData() {
		const [districtConsumptionData, zoneConsumptionData, maxTimestamp] = await Promise.all([
			this.getDistrictConsumptionData(),
			this.getZoneConsumptionData(),
			getMaxTimestamp(DataType.CONSUMPTION)
		]);

		this.setState({
			districtConsumptionData,
			zoneConsumptionData,
			maxTimestamp: new Date(maxTimestamp),
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
		const historicalDistrictConsumptionData = this.state.districtConsumptionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const historicalzoneConsumptionData = this.state.zoneConsumptionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const forecastedDistrictConsumptionData = this.state.districtConsumptionData.filter((point) => {
			return point.x.getTime() > this.state.maxTimestamp.getTime();
		});

		const forecastedzoneConsumptionData = this.state.zoneConsumptionData.filter((point) => {
			return point.x.getTime() > this.state.maxTimestamp.getTime();
		});

		const chartOptions = {
			exportEnabled: true,
			animationEnabled: true,
			axisX: {
				fontFamily: "Ubuntu",
			},
			axisY: {
				fontFamily: "Ubuntu",
				title: "kWh",
				titleFontWeight: "bold",
			},
			toolTip: {
				shared: true,
			},
			data: [
				{
					type: "column",
					name: "Consommation de La Bastide (kWh)",
					dataPoints: historicalDistrictConsumptionData,
					color: "#688199"
				},
				{
					type: "column",
					name: `Consommation de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: historicalzoneConsumptionData,
					color: "#e63b11"
				},
				{
					type: "column",
					name: `Prédiction de consommation de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: forecastedzoneConsumptionData,
					color: "#e63b11",
					fillOpacity: .3,
				},
				{
					type: "column",
					name: "Prédiction de consommation de La Bastide (kWh)",
					dataPoints: forecastedDistrictConsumptionData,
					color: "#688199",
					fillOpacity: .3
				},
			]
		}

		return (
			<div id="weekly-consumption" className="graph-indicator">
				<div id="weekly-consumption-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div id="weekly-consumption-legend" className="graph-legend">
					<div id="weekly-consumption-legend-urban-zone" className="graph-legend-item">
						<div id="weekly-consumption-legend-urban-zone-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation de la zone urbaine
						</p>
					</div>
					<div id="weekly-consumption-legend-district" className="graph-legend-item">
						<div id="weekly-consumption-legend-district-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Consommation du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
