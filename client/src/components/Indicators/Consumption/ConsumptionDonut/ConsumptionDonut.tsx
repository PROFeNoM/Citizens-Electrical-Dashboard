import './ConsumptionDonut.css';

import React from 'react';
import { CanvasJSChart } from 'canvasjs-react-charts';

import { ConsumerProfile } from 'constants/profiles';
import { getTotalConsumption } from 'scripts/api';
import { getZonesGeoJSON } from 'geodata';

interface Props {
	t1: number;
	t2: number;
	urbanZone: string;
	buildingType: ConsumerProfile;
	setHighlightedZone: (val: string | null) => void;
}

interface State {
	consumptionDistribution: { name: string, y: number }[];
	urbanZoneProportion: number;
}

export default class ConsumptionDonut extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			consumptionDistribution: null,
			urbanZoneProportion: null
		};

		this.fetchData = this.fetchData.bind(this);
		this.onClick = this.onClick.bind(this);
	}

	async fetchData() {
		const { t1, t2, urbanZone } = this.props;

		const consumptions = await Promise.all((await getZonesGeoJSON()).features.map(async f => ({
			name: f.properties.libelle,
			value: await getTotalConsumption(
				t1,
				t2,
				this.props.buildingType && this.props.buildingType !== ConsumerProfile.ALL ? [this.props.buildingType] : undefined,
				f.properties.libelle
			)
		})));


		const totalConsumption = consumptions.reduce((acc, zone) => acc + zone.value, 0);

		// Consumptions is zero for all zones during the selected time period
		if (totalConsumption === 0) {
			this.setState(state => ({
				...state,
				consumptionDistribution: [],
				urbanZoneProportion: 0
			}));
			return;
		}

		const consumptionDistribution = consumptions.map(p => ({
			name: p.name,
			y: p.value / totalConsumption * 100
		}));

		this.setState(state => ({
			...state,
			consumptionDistribution: consumptionDistribution
		}));

		if (urbanZone) {
			this.setState(state => ({
				...state,
				urbanZoneProportion: consumptions.find(zone => zone.name === urbanZone).value / totalConsumption * 100
			}));
		} else {
			this.setState(state => ({
				...state,
				urbanZoneProportion: 100
			}));
		}

	}

	private onClick(e: any) {
		this.props.setHighlightedZone(e.dataPoint.name);
	}

	async componentDidMount() {
		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error fetching data', e);
		}
	}

	async componentDidUpdate(prevProps: Props) {
		if (prevProps.t1 !== this.props.t1 || prevProps.t2 !== this.props.t2 || prevProps.urbanZone !== this.props.urbanZone || prevProps.buildingType !== this.props.buildingType) {
			try {
				await this.fetchData();
			} catch (e) {
				console.error('Error fetching data', e);
			}
		}
	}

	render() {
		const { consumptionDistribution, urbanZoneProportion } = this.state;
		const text = consumptionDistribution === null
			? 'Chargement...' : consumptionDistribution.length === 0
			? 'Pas de données pour la période' : `${Math.round(urbanZoneProportion)}%`;

		const chartOptions = {
			animationEnabled: false,
			subtitles: [{
				text: text,
				verticalAlign: 'center',
				fontSize: 24,
				fontFamily: 'Ubuntu',
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: false,
				indexLabel: "{name} - {y}",
				yValueFormatString: "#,###'%'",
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
