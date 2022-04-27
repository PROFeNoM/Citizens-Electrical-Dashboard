import React from 'react';
import { getTotalConsumption, ConsumerProfile } from 'scripts/api';
import { zones } from 'geodata';
import { CanvasJSChart } from 'canvasjs-react-charts';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	buildingType: ConsumerProfile;
	title: string;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	consumptionDistribution: { name: string, y: number }[];
	urbanZoneProportion: number;
	renderMe: boolean;
}

export default class ConsumptionDonut extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		const tmpPoints = zones.features.map(f => {
			return { name: f.properties.libelle, y: 0 };
		})

		this.state = {
			consumptionDistribution: tmpPoints,
			urbanZoneProportion: 0,
			renderMe: false
		};
	}

	async fetchData() {
		const { t1, t2, urbanZone } = this.props;
		const consumptions = await Promise.all(zones.features.map(async f => {
			return {
				name: f.properties.libelle,
				value: await getTotalConsumption(
					t1,
					t2,
					this.props.buildingType ? (this.props.buildingType !== ConsumerProfile.ALL ? [this.props.buildingType] : undefined) : undefined,
					f.properties.libelle)
			};
		}));

		const totalConsumption = consumptions.reduce((acc, p) => acc + p.value, 0);
		const consumptionDistribution = consumptions.map(p => {
			return { name: p.name, y: p.value / totalConsumption * 100 };
		});

		this.setState({
			consumptionDistribution: consumptionDistribution,
			urbanZoneProportion: consumptions.find(z => z.name === urbanZone).value / totalConsumption * 100,
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
				dataPoints: this.state.consumptionDistribution,
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

