import './TotalConsumption.css';
import React from 'react';
import {CanvasJSChart} from 'canvasjs-react-charts';
import {
	Building,
	getDistrictElectricityConsumption,
	getMeanUrbanZoneElectricityConsumption,
	getMeanUrbanZoneElectricityProduction,
	getUrbanZoneElectricityProduction,
	getZoneConsumption,
} from "../../scripts/dbUtils";

interface Props {
	t1: number,
	t2: number,
	urbanZone: string,
	title: string
}

interface State {
	districtConsumptionData: {label: string, y: number}[],
	urbanZoneConsumptionData: {label: string, y: number}[]
}

export default class TotalConsumption extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = {
			districtConsumptionData: [],
			urbanZoneConsumptionData: []
		};
	}

	private async getDistrictConsumptionData() {
		return (
			[
				{label: "Total", y: Math.round(await getDistrictElectricityConsumption(this.props.t1, Building.All, this.props.t2)/1000)},
				{label: "Residentiels", y: Math.round(await getDistrictElectricityConsumption(this.props.t1, Building.Residential, this.props.t2)/1000)},
				{label: "Tertiaires", y: Math.round(await getDistrictElectricityConsumption(this.props.t1, Building.Tertiary, this.props.t2)/1000)},
				{label: "Professionnels", y: Math.round(await getDistrictElectricityConsumption(this.props.t1, Building.Professional, this.props.t2)/1000)},
				{label: "Eclairage", y: Math.round(await getDistrictElectricityConsumption(this.props.t1, Building.Lighting, this.props.t2)/1000)}
			]);
	}
	
	private async getUrbanZoneConsumptionData() {

		return (
		[
			{label: "Total", y: Math.round(await getZoneConsumption(this.props.t1, Building.All, this.props.urbanZone, this.props.t2)/1000)},
			{label: "Residentiels", y: Math.round(await getZoneConsumption(this.props.t1, Building.Residential, this.props.urbanZone, this.props.t2)/1000)},
			{label: "Tertiaires", y: Math.round(await getZoneConsumption(this.props.t1, Building.Tertiary, this.props.urbanZone, this.props.t2)/1000)},
			{label: "Professionnels", y: Math.round(await getZoneConsumption(this.props.t1, Building.Professional, this.props.urbanZone, this.props.t2)/1000)},
			{label: "Eclairage", y: Math.round(await getZoneConsumption(this.props.t1, Building.Lighting, this.props.urbanZone, this.props.t2)/1000)}
		]);
	}

	async componentDidMount() {
		const districtConsumptionData = await this.getDistrictConsumptionData();
	 	const urbanZoneConsumptionData = await this.getUrbanZoneConsumptionData();
	 	this.setState({
	 		districtConsumptionData: districtConsumptionData,
	 		urbanZoneConsumptionData: urbanZoneConsumptionData
	 	});
	}

	render() {

		const chartOptions = {
			animationEnabled: true,
			axisX: {
				fontFamily: 'Ubuntu',
				title: 'Filière',
				titleFontWeight: 'bold'
			},
			axisY: {
				fontFamily: 'Ubuntu',
				title: 'kWh',
				titleFontWeight: 'bold',
				logarithmic: false
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
				dataPoints: this.state.districtConsumptionData,
				color: '#688199'
			}, {
				type: "column",
				name: "Consommation de la zone urbaine (kWh)",
				axisYType: "primary",
				dataPoints: this.state.urbanZoneConsumptionData,
				color: '#e63b11'
			}]
		}


		return (
			<div className='typical-c-day-wrapper'>
				<div className='typical-c-day-title-wrapper'>
					{this.props.title}
				</div>
				<div className="typical-consumption-day-graph-wrapper">
					<CanvasJSChart options={chartOptions}/>
				</div>
				<div className='typical-c-day-legend-wrapper'>
					<div className='typical-c-day-urbanZone-legend-wrapper'>
						<div className='typical-c-day-urbanZone-color'/>
						<p className='typical-c-day-urbanZone-text'>Consommation par filière dans la zone urbaine</p>
					</div>
					<div className='typical-c-day-district-legend-wrapper'>
						<div className='typical-c-day-district-color'/>
						<p className='typical-c-day-district-text'>Consommation par filière dans le quartier</p>
					</div>
				</div>
			</div>
		)
	}
}