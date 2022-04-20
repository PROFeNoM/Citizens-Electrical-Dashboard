import React from 'react';
import { getTotalProduction, ProducerProfile } from "../../scripts/api";
import { zones } from "../../geodata";
import { CanvasJSChart } from 'canvasjs-react-charts';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	title: string;
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
		const tmpPoints = zones.features.map(f => {
			return { name: f.properties.libelle, y: 0 };
		})

		this.state = {
			productionDistribution: tmpPoints,
			urbanZoneProportion: 0,
			renderMe: false
		};
	}

	async fetchData(){
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
		const productions = zones.features.map(f => {
			return { name: f.properties.libelle, value: f.properties.PROD_F5 };
		});
		const totalProduction = zones.features.reduce((acc, f) => acc + f.properties.PROD_F5, 0);
		const productionDistribution = productions.map(p => {
			return { name: p.name, y: p.value / totalProduction * 100 };
		}).filter(p => p.y > 0);

		this.setState({
			productionDistribution: productionDistribution,
			urbanZoneProportion: productions.find(z => z.name === urbanZone).value / totalProduction * 100,
			renderMe: true
		});
	}

	async componentDidMount() {
		await this.fetchData();
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
		}

		return (
			<div className="typical-c-day-wrapper">
				<div className="typical-c-day-title-wrapper">{this.props.title}</div>
				<div className="typical-consumption-day-graph-wrapper">
					<CanvasJSChart options={chartOptions} />
				</div>
			</div>
		)
	}

}

