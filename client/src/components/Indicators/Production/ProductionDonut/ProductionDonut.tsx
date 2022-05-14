import './ProductionDonut.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { getZonesGeoJSON } from 'geodata';
import { ProducerProfile } from 'constants/profiles';
import { getTotalProduction } from 'scripts/api';

interface Props {
	zoneName: string; // The name of the current zone
	t1: number; // Start time of the current period (Unix milliseconds)
	t2: number; // End time of the current period (Unix milliseconds)
	setHighlightedZone: (val: string | null) => void; // Callback to set the highlighted zone
}

interface State {
	productionDistribution: { name: string, y: number }[]; // Distribution of the consumption in the zone
	zoneProportion: number; // Proportion of the zone production compared to the total district (%)
}

/**
 * Graphical indicator (donut chart) that displays the production distribution between all the zones.
 */
export default class ProductionDonut extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			productionDistribution: [],
			zoneProportion: 0
		};

		this.onClick = this.onClick.bind(this);
		this.fetchData = this.fetchData.bind(this);
	}

	private async fetchData() {
		const { t1, t2, zoneName } = this.props;

		const zonesGeoJSON = await getZonesGeoJSON();

		this.setState({
			productionDistribution: zonesGeoJSON.features.map(f => ({ name: f.properties.libelle, y: 0 })),
		});

		const productions = await Promise.all(zonesGeoJSON.features.map(async f => {
			return { name: f.properties.libelle, value: await getTotalProduction(t1, t2, [ProducerProfile.SOLAR], f.properties.libelle) };
		}));

		const totalProduction = productions.reduce((acc, p) => acc + p.value, 0);

		// Production is zero for all zones during the selected time period
		if (totalProduction === 0) {
			this.setState({
				productionDistribution: [],
				zoneProportion: 0
			});
			return;
		}

		const productionDistribution = productions
			.map(zone => ({
				name: zone.name,
				y: zone.value / totalProduction * 100
			}))
			.filter(zone => zone.y > 0);

		this.setState({
			productionDistribution: productionDistribution,
			zoneProportion: zoneName ? productions.find(zone => zone.name === zoneName).value / totalProduction * 100 : 100
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
		const { productionDistribution, zoneProportion } = this.state;
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'decimal',
			maximumFractionDigits: 1
		});
		const text = productionDistribution === null
			? 'Chargement...' : productionDistribution.length === 0
				? 'Pas de données pour la période' : `${formatter.format(zoneProportion)}%`;

		const chartOptions = {
			exportEnabled: true,
			animationEnabled: true,
			subtitles: [{
				text: text,
				verticalAlign: 'center',
				fontSize: 15,
				fontFamily: "Ubuntu",
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: false,
				indexLabel: "{name}: {y}",
				yValueFormatString: "0.#'%'",
				dataPoints: this.state.productionDistribution,
				click: this.onClick
			}]
		};

		return (
			<div id="solar-production" className="graph-indicator">
				<div id="solar-production-graph-wrapper" className="graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
			</div>
		);
	}
}
