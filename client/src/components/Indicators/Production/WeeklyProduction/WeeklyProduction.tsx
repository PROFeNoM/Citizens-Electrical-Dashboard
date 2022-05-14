import './WeeklyProduction.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ProducerProfile, DataType } from 'constants/profiles';
import { getMaxTimestamp, getTotalProduction } from 'scripts/api';
import { wattsToKilowatts } from 'scripts/utils';

interface Props {
	zoneName: string; // The name of the current zone
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
}

interface State {
	districtProductionData: { x: Date, y: number }[]; // Production data for the district
	zoneProductionData: { x: Date, y: number }[];
	maxTimestamp: Date;
}

/**
 * Graphical indicator (bar chart) that displays
 * the production of the district and the zone each week, in kWh.
 * This indicator allows to see production forecasts.
 **/
export default class WeeklyProduction extends React.Component<Props, State> {
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
			districtProductionData: tmpPoints,
			zoneProductionData: tmpPoints,
			maxTimestamp: new Date()
		};
	}

	
 	// Create a list of start and end week dates that span over the period from t1 to t2
	private getWeeks() {
		const startDate = new Date(this.props.t1);
		const endDate = new Date(this.props.t2);
		return Array.from(Array(Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))).keys())
			.map((w) => {
				const start = new Date(startDate.getTime() + (w * 7 * 24 * 60 * 60 * 1000));
				const end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000));
				return {
					start: start.getTime(),
					end: end.getTime()
				};
			});
	}

	private async getDistrictProductionData() {
		const weeks = this.getWeeks();

		// Determine the total production for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalProduction = await getTotalProduction(week.start, week.end, [ProducerProfile.SOLAR]);
			return {
				x: new Date(week.start),
				y: Math.round(wattsToKilowatts(totalProduction)),
			};
		}));
	}

	private async getZoneProductionData() {
		const weeks = this.getWeeks();

		// Determine the total production for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalProduction = await getTotalProduction(week.start, week.end, [ProducerProfile.SOLAR], this.props.zoneName);
			return {
				x: new Date(week.start),
				y: Math.round(wattsToKilowatts(totalProduction)),
			};
		}));
	}

	private async fetchData() {
		const [districtProductionData, zoneProductionData, maxTimestamp] = await Promise.all([
			this.getDistrictProductionData(),
			this.getZoneProductionData(),
			getMaxTimestamp(DataType.PRODUCTION)
		]);

		this.setState({
			districtProductionData,
			zoneProductionData,
			maxTimestamp: new Date(maxTimestamp)
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
		const historicalDistrictProductionData = this.state.districtProductionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const historicalUrbanZoneProductionData = this.state.zoneProductionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const forecastedDistrictProductionData = this.state.districtProductionData.filter((point) => {
			return point.x.getTime() > this.state.maxTimestamp.getTime();
		});

		const forecastedUrbanZoneProductionData = this.state.zoneProductionData.filter((point) => {
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
					name: "Production de La Bastide (kWh)",
					dataPoints: historicalDistrictProductionData,
					color: "#688199"
				},
				{
					type: "column",
					name: `Production de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: historicalUrbanZoneProductionData,
					color: "#e63b11"
				},
				{
					type: "column",
					name: `Prédiction de production de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: forecastedUrbanZoneProductionData,
					color: "#e63b11",
					fillOpacity: .3
				},
				{
					type: "column",
					name: "Prédiction de production de La Bastide (kWh)",
					dataPoints: forecastedDistrictProductionData,
					color: "#688199",
					fillOpacity: .3
				},
			]
		}

		return (
			<div id="weekly-production" className="graph-indicator">
				<div id="weekly-production-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
				<div id="weekly-production-legend" className="graph-legend">
					<div id="weekly-production-legend-urban-zone" className="graph-legend-item">
						<div id="weekly-production-legend-urban-zone-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Production solaire de la zone urbaine
						</p>
					</div>
					<div id="weekly-production-legend-district" className="graph-legend-item">
						<div id="weekly-production-legend-district-color" className="graph-legend-item-color" />
						<p className="graph-legend-item-text">
							Production solaire du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}
