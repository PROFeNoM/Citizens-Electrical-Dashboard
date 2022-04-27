import React from 'react';
import { getZonesNames } from '../../scripts/dbUtils';
import copy from 'fast-copy';
import { ConsumerProfile, getTotalConsumption, getTotalProduction } from '../../scripts/api';

const formatter = new Intl.NumberFormat();

interface Data {
	nbOfStations: number,
	nbOfChargingPoints: number,
}

interface Props {
	selectedZoneName: string,
	/** when the cancel btn is pressed (should unselect the currently selected zone) */
}

interface State {
	districtData: Data,
	zonesData: { [name: string]: Data },
}

export default class ChargingStationIndicator extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			districtData: {
				nbOfStations: 4,
				nbOfChargingPoints: 12,
			},
			zonesData: {},
		};
		
		for (const zoneName of getZonesNames()) {
			this.state.zonesData[zoneName] = {
				nbOfStations: 4,
				nbOfChargingPoints:12,
			};

			this.state.districtData.nbOfStations = this.state.zonesData[zoneName].nbOfStations;
			this.state.districtData.nbOfChargingPoints = this.state.zonesData[zoneName].nbOfChargingPoints;
		}
		
	}
	async componentDidMount() {
		const t1 = new Date('2021-12-01T00:30:00').getTime();
		const t2 = new Date('2021-12-31T23:30:00').getTime();

		let districtConsumption = 0;
		let districtProduction = 0;

		await Promise.all(getZonesNames().map(async zoneName => {
			const [zoneConsumption, zoneProduction] = await Promise.all([
				getTotalConsumption(t1, t2, undefined, zoneName),
				getTotalProduction(t1, t2, undefined, zoneName),
			]);

			this.setState(oldState => {
				const newState = copy(oldState);
				return newState
			})

			districtConsumption += zoneConsumption;
			districtProduction += zoneProduction;
		}));

		this.setState(oldState => {
			const newState = copy(oldState);
			return newState
		})
	}
	private get currentData(): Data {
		return this.props.selectedZoneName !== null
			? this.state.zonesData[this.props.selectedZoneName]
			: this.state.districtData;
	}

	render() {
		const data = this.currentData;
		const title = this.props.selectedZoneName ?? 'Quartier de la Bastide';
		const nbStations = formatter.format(data.nbOfStations);
		const nbChargingPoints = formatter.format(data.nbOfChargingPoints);
		

		return (
			<div id="district-info-wrapper">
				<div id="district-info">
					<h2 id="district-name">{title}</h2>
					<ul>
						<li><span className="data">{nbStations}</span> stations de recharge electrique</li>
						<li><span className="data">{nbChargingPoints}</span> Bornes de recharge en total</li>
					</ul>
					{

					}
				</div>
			</div>
		);
	}
}
