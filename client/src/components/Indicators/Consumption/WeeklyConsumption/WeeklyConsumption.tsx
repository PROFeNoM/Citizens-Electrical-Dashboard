import './WeeklyConsumption.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { DataType, ConsumerProfile } from 'constants/profiles';
import { getMaxTimestamp, getTotalConsumption } from 'scripts/api';

interface Props {
	zoneName: string;
	sector: ConsumerProfile;
	t1: number;
	t2: number;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	districtConsumptionData: { x: Date, y: number }[];
	urbanZoneConsumptionData: { x: Date, y: number }[];
	maxTimestamp: Date;
}

export default class WeeklyConsumption extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const tmpPoints = this.getWeeks().map((week) => {
			return {
				x: new Date(week.start),
				y: 42,
			};
		});
		this.state = {
			districtConsumptionData: tmpPoints,
			urbanZoneConsumptionData: tmpPoints,
			maxTimestamp: new Date()
		};
	}

	/** 
	 * Create a list of start and end week dates that span over the period from t1 to t2
	 * t1 and t2 are given from props
	 * t1 and t2 are in Unix milliseconds
	**/
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

	/**
	 * Create a list of start and end week dates that span over the period from t1 to t2
	 * t1 and t2 are given from props
	 * t1 and t2 are in Unix milliseconds
	 **/
	private async getDistrictConsumptionData() {
		const { sector } = this.props;

		const weeks = this.getWeeks();

		// Determine the total Consumption for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalConsumption = await getTotalConsumption(week.start, week.end, [sector]);
			return {
				x: new Date(week.start),
				y: totalConsumption,
			};
		}));
	}

	private async getUrbanZoneConsumptionData() {
		const { zoneName, sector } = this.props;

		const weeks = this.getWeeks();

		// Determine the total consumption for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalConsumption = await getTotalConsumption(week.start, week.end, [sector], zoneName);
			return {
				x: new Date(week.start),
				y: totalConsumption,
			};
		}));
	}

	private async fetchData() {
		const [districtConsumptionData, urbanZoneConsumptionData, maxTimestamp] = await Promise.all([
			this.getDistrictConsumptionData(),
			this.getUrbanZoneConsumptionData(),
			getMaxTimestamp(DataType.CONSUMPTION)
		]);

		this.setState({
			districtConsumptionData,
			urbanZoneConsumptionData,
			maxTimestamp: new Date(maxTimestamp),
		});
	}

	private onClick() {
		this.props.setHighlightedZone(this.props.zoneName);
	}

	async componentDidMount() {
		await this.fetchData();
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

		const historicalUrbanZoneConsumptionData = this.state.urbanZoneConsumptionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const forecastedDistrictConsumptionData = this.state.districtConsumptionData.filter((point) => {
			return point.x.getTime() > this.state.maxTimestamp.getTime();
		});

		const forecastedUrbanZoneConsumptionData = this.state.urbanZoneConsumptionData.filter((point) => {
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
					color: "#688199",
					click: this.onClick
				},
				{
					type: "column",
					name: `Consommation de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: historicalUrbanZoneConsumptionData,
					color: "#e63b11",
					click: this.onClick
				},
				{
					type: "column",
					name: `Prédiction de consommation de ${this.props.zoneName ?? 'La Bastide'} (kWh)`,
					dataPoints: forecastedUrbanZoneConsumptionData,
					color: "#e63b11",
					click: this.onClick,
					fillOpacity: .3,
				},
				{
					type: "column",
					name: "Prédiction de consommation de La Bastide (kWh)",
					dataPoints: forecastedDistrictConsumptionData,
					color: "#688199",
					click: this.onClick,
					fillOpacity: .3,
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
