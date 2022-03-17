import './TypicalConsumptionDay.css';
import React from 'react';
import {CanvasJSChart} from 'canvasjs-react-charts';
import {
	Building,
	getMeanUrbanZoneElectricityConsumption,
	getMeanUrbanZoneElectricityProduction,
} from "../../scripts/dbUtils";

const tmpPoints = Array
	.from(Array(24).keys())
	.map(h => {
		return {
			x: new Date(Date.UTC(2022, 1, 1, h, 0)),
			y: 42
		}
	});

interface Props {
	t1: number,
	t2: number,
	urbanZone: string,
	buildingType: Building,
	title: string
}

interface State {
	selfConsumptionData: { x: Date, y: number }[],
	districtConsumptionData: { x: Date, y: number }[],
	urbanZoneConsumptionData: { x: Date, y: number }[]
}

export default class TypicalConsumptionDay extends React.Component<Props, State> {
	private chart: React.RefObject<unknown>;
	constructor(props) {
		super(props);
		this.state = {
			selfConsumptionData: tmpPoints,
			districtConsumptionData: tmpPoints,
			urbanZoneConsumptionData: tmpPoints
		};
		this.chart = React.createRef();
	}

	private async getSelfConsumptionData() {
		const meanCons = await getMeanUrbanZoneElectricityConsumption(this.props.t1, this.props.buildingType, this.props.urbanZone, this.props.t2);
		const meanProd = await getMeanUrbanZoneElectricityProduction(this.props.t1, this.props.urbanZone, this.props.t2);

		return meanCons.map(((el, index) => {
			return {
				x: el.hour,
				y: Math.round(meanProd[index].mean / el.mean * 100) / 100
			}
		}));
	}

	private async getDistrictConsumptionData() {
		const meanCons = await getMeanUrbanZoneElectricityConsumption(this.props.t1, this.props.buildingType, 'La Bastide', this.props.t2);

		return meanCons.map(el => {
			return {
				x: el.hour,
				y: Math.round(el.mean / 1000)
			}
		});
	}

	private async getUrbanZoneConsumptionData() {
		const meanCons = await getMeanUrbanZoneElectricityConsumption(this.props.t1, this.props.buildingType, this.props.urbanZone, this.props.t2);

		return meanCons.map(el => {
			return {
				x: el.hour,
				y: Math.round(el.mean / 1000)
			}
		});
	}

	async componentWillMount() {
		const selfConsumptionData = await this.getSelfConsumptionData();
		const districtConsumptionData = await this.getDistrictConsumptionData();
		const urbanZoneConsumptionData = await this.getUrbanZoneConsumptionData();
		this.setState({
			selfConsumptionData: selfConsumptionData,
			districtConsumptionData: districtConsumptionData,
			urbanZoneConsumptionData: urbanZoneConsumptionData
		});
		//console.log(this.props.title, this.chart)
		//console.log(this.props.title, this.state);
	}

	render() {
		const chartOptions = {
			animationEnabled: true,
			axisX: {
				valueFormatString: "HH:mm",
				fontFamily: 'Ubuntu',
			},
			axisY: {
				fontFamily: 'Ubuntu',
				title: 'kWh',
				titleFontWeight: 'bold'
			},
			axisY2: {
				lineColor: '#93c90e',
				labelFontColor: '#93c90e',
				tickColor: '#93c90e',
				fontFamily: 'Ubuntu'
			},
			toolTip: {
				shared: true
			},
			data: [{
				type: "column",
				name: "Consommation de La Bastide (kWh)",
				axisYType: "primary",
				xValueFormatString: "HH:mm",
				dataPoints: this.state.districtConsumptionData,
				color: '#688199'
			}, {
				type: "column",
				name: "Consommation de la zone urbaine (kWh)",
				axisYType: "primary",
				xValueFormatString: "HH:mm",
				dataPoints: this.state.urbanZoneConsumptionData,
				color: '#e63b11'
			}, {
				type: "line",
				name: "Auto-consommation (%)",
				axisYType: "secondary",
				xValueFormatString: "HH:mm",
				dataPoints: this.state.selfConsumptionData,
				color: '#93c90e'
			}]
		}
		//console.log("[RENDER]", this.props.title, this.state);

		return (
			<div className='typical-c-day-wrapper'>
				<div className='typical-c-day-title-wrapper'>
					{this.props.title}
				</div>
				<div className="typical-consumption-day-graph-wrapper">
					<CanvasJSChart options={chartOptions}
						onRef={ref => this.chart = ref}/>
				</div>
				<div className='typical-c-day-legend-wrapper'>
					<div className='typical-c-day-urbanZone-legend-wrapper'>
						<div className='typical-c-day-urbanZone-color'/>
						<p className='typical-c-day-urbanZone-text'>Consommation moyenne de la zone urbaine</p>
					</div>
					<div className='typical-c-day-district-legend-wrapper'>
						<div className='typical-c-day-district-color'/>
						<p className='typical-c-day-district-text'>Consommation moyenne du quartier</p>
					</div>
					<div className='typical-c-day-selfCons-legend-wrapper'>
						<div className='typical-c-day-selfCons-color'/>
						<p className='typical-c-day-selfCons-text'>Autoconsommation moyenne de la zone urbaine</p>
					</div>
				</div>
			</div>
		)
	}
}