import './ConsumptionDonut.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ConsumerProfile } from 'constants/profiles';
import { getTotalConsumption } from 'scripts/api';
import { getZonesGeoJSON } from 'geodata';

interface Props {
	zoneName: string; // Name of the current zone
	buildingType: ConsumerProfile; // Current consumer profile
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
	setHighlightedZone: (val: string | null) => void; // Callback to set the highlighted zone on the map
}

interface State {
	consumptionDistribution: { name: string, y: number }[]; // Distribution of the consumption in the zone
	zoneProportion: number; // Proportion of the zone consumption compared to the total district (%)
}

/**
 * Graphical indicator (donut chart) that displays the consumption distribution between all the zones.
 */
export default class ConsumptionDonut extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			consumptionDistribution: null,
			zoneProportion: null
		};

		this.fetchData = this.fetchData.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	private async fetchData() {
		const { t1, t2, zoneName } = this.props;

		const consumptions = await Promise.all(
			(await getZonesGeoJSON()).features
				.map(async f => (
					{
						name: f.properties.libelle,
						value: await getTotalConsumption(
							t1,
							t2,
							this.props.buildingType && this.props.buildingType !== ConsumerProfile.ALL ? [this.props.buildingType] : undefined,
							f.properties.libelle
						)
					}
				))
		);

		const totalConsumption = consumptions.reduce((acc, zone) => acc + zone.value, 0);

		// Consumption is zero for all zones during the selected time period
		if (totalConsumption === 0) {
			this.setState({
				consumptionDistribution: [],
				zoneProportion: 0
			});
			return;
		}

		const consumptionDistribution = consumptions
			.map(zone => ({
				name: zone.name,
				y: zone.value / totalConsumption * 100
			}))
			.filter(zone => zone.y > 0);

		this.setState({
			consumptionDistribution,
			zoneProportion: zoneName ? consumptions.find(zone => zone.name === zoneName).value / totalConsumption * 100 : 100
		});
	}

	private onClick(e: any) {
		this.props.setHighlightedZone(e.dataPoint.name);
	}

	async componentDidMount() {
		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.zoneName === this.props.zoneName && prevProps.buildingType === this.props.buildingType && prevProps.t1 === this.props.t1 && prevProps.t2 === this.props.t2) {
			return;
		}

		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	render() {
		const { consumptionDistribution, zoneProportion } = this.state;
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'decimal',
			maximumFractionDigits: 1
		});
		const text = consumptionDistribution === null
			? 'Chargement...' : consumptionDistribution.length === 0
				? 'Pas de donn??es pour la p??riode' : `${formatter.format(zoneProportion)}%`;

		const chartOptions = {
			animationEnabled: false,
			subtitles: [{
				text: text,
				verticalAlign: 'center',
				fontSize: 15,
				fontFamily: 'Ubuntu',
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: false,
				indexLabel: "{name} - {y}",
				yValueFormatString: "0.#'%'",
				dataPoints: consumptionDistribution,
				click: this.onClick
			}]
		};

		return (
			<div id="consumption-donut" className="graph-indicator">
				<div id="consumption-donut-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
			</div>
		);
	}
}
