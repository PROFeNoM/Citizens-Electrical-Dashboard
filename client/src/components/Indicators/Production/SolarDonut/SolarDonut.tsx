import './SolarDonut.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { getZonesGeoJSON } from 'geodata';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	productionDistribution: { name: string, y: number }[];
	urbanZoneProportion: number;
	renderMe: boolean;
}

export default class SolarDonut extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			productionDistribution: [],
			urbanZoneProportion: 0,
			renderMe: false
		};
	}

	async componentDidMount() {
		const zonesGeoJSON = await getZonesGeoJSON();

		this.setState({
			productionDistribution: zonesGeoJSON.features.map(f => ({ name: f.properties.libelle, y: 0 })),
		})

		const { t1, t2, urbanZone } = this.props;
		/*
		const productions = await Promise.all(zones.features.map(async f => {
			return { name: f.properties.libelle, value: await getTotalProduction(t1, t2, [ProducerProfile.SOLAR], f.properties.libelle) };
		}));

		const totalProduction = productions.reduce((acc, p) => acc + p.value, 0);
		const productionDistribution = productions.map(p => {
			return { name: p.name, y: p.value / totalProduction * 100 };
		});
		*/
		const productions = zonesGeoJSON.features.map(f => {
			return { name: f.properties.libelle, value: f.properties.PROD_F5 };
		});
		const totalProduction = zonesGeoJSON.features.reduce((acc, f) => acc + f.properties.PROD_F5, 0);
		const productionDistribution = productions.map(p => {
			return { name: p.name, y: p.value / totalProduction * 100 };
		}).filter(p => p.y > 0);

		this.setState({
			productionDistribution: productionDistribution,
			urbanZoneProportion: urbanZone ? productions.find(z => z.name === urbanZone).value / totalProduction * 100 : 100,
			renderMe: true
		});
	}

	private onClick = (e: any) => {
		this.props.setHighlightedZone(e.dataPoint.name);
	}

	render() {
		const chartOptions = {
			exportEnabled: true,
			animationEnabled: true,
			subtitles: [{
				text: Math.round(this.state.urbanZoneProportion) + '%',
				verticalAlign: 'center',
				fontSize: 24,
				fontFamily: "Ubuntu",
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: false,
				indexLabel: "{name}: {y}",
				yValueFormatString: "#,###'%'",
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
