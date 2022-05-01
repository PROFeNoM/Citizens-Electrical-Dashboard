import React from 'react';
import {CanvasJSChart} from 'canvasjs-react-charts';
import {DataType, getMaxTimestamp, getTotalProduction, ProducerProfile} from 'scripts/api';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	title: string;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	districtProductionData: { x: Date, y: number }[];
	urbanZoneProductionData: { x: Date, y: number }[];
	maxTimestamp: Date;
	renderMe: boolean;
}

export default class WeeklyProduction extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const tmpPoints = this.getWeeks().map((week) => {
			return {
				x: new Date(week.start),
				y: 42,
			};
		});
		this.state = {
			districtProductionData: tmpPoints,
			urbanZoneProductionData: tmpPoints,
			maxTimestamp: new Date(),
			renderMe: false,
		};
	}

	private getWeeks() {
		// Create a list of start and end week dates that span over the period from t1 to t2
		// t1 and t2 are given from props
		// t1 and t2 are in Unix milliseconds
		const startDate = new Date(this.props.t1);
		const endDate = new Date(this.props.t2);
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

	private async getDistrictProductionData() {
		// Create a list of start and end week dates that span over the period from t1 to t2
		// t1 and t2 are given from props
		// t1 and t2 are in Unix milliseconds
		const weeks = this.getWeeks();

		// Determine the total production for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalProduction = await getTotalProduction(week.start, week.end, [ProducerProfile.SOLAR]);
			return {
				x: new Date(week.start),
				y: totalProduction,
			};
		}));
	}

	private async getUrbanZoneProductionData() {
		const weeks = this.getWeeks();

		// Determine the total production for each week
		return await Promise.all(weeks.map(async (week) => {
			const totalProduction = await getTotalProduction(week.start, week.end, [ProducerProfile.SOLAR], this.props.urbanZone);
			return {
				x: new Date(week.start),
				y: totalProduction,
			};
		}));
	}

	async fetchData() {
		const districtProductionData = await this.getDistrictProductionData();
		const urbanZoneProductionData = await this.getUrbanZoneProductionData();
		const maxTimestamp = await getMaxTimestamp(DataType.PRODUCTION)
		this.setState({
			districtProductionData: districtProductionData,
			urbanZoneProductionData: urbanZoneProductionData,
			maxTimestamp: new Date(maxTimestamp),
			renderMe: true,
		});
	}

	async componentDidMount() {
		await this.fetchData();
	}

	private onClick = () => {
		this.props.setHighlightedZone(this.props.urbanZone);
	}

	render() {
		// Retrieve database's max timestamp of historical data
		console.log(this.state.maxTimestamp);

		const historicalDistrictProductionData = this.state.districtProductionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const historicalUrbanZoneProductionData = this.state.urbanZoneProductionData.filter((point) => {
			return point.x.getTime() <= this.state.maxTimestamp.getTime();
		});

		const forecastedDistrictProductionData = this.state.districtProductionData.filter((point) => {
			return point.x.getTime() > this.state.maxTimestamp.getTime();
		});

		const forecastedUrbanZoneProductionData = this.state.urbanZoneProductionData.filter((point) => {
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
					color: "#688199",
					click: this.onClick
				},
				{
					type: "column",
					name: "Production de " + this.props.urbanZone + " (kWh)",
					dataPoints: historicalUrbanZoneProductionData,
					color: "#e63b11",
					click: this.onClick
				},
				{
					type: "column",
					name: "Prédiction de production de " + this.props.urbanZone + " (kWh)",
					dataPoints: forecastedUrbanZoneProductionData,
					color: "#e63b11",
					click: this.onClick,
					fillOpacity: .3,
				},
				{
					type: "column",
					name: "Prédiction de production de La Bastide (kWh)",
					dataPoints: forecastedDistrictProductionData,
					color: "#688199",
					click: this.onClick,
					fillOpacity: .3,
				},
			]
		}

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
							Production solaire de la zone urbaine
						</p>
					</div>
					<div className="typical-c-day-district-legend-wrapper">
						<div className="typical-c-day-district-color" />
						<p className="typical-c-day-district-text">
							Production solaire du quartier
						</p>
					</div>
				</div>
			</div>
		);
	}
}