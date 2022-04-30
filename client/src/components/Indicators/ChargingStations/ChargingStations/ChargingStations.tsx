import './ChargingStations.css';

import React from 'react';
import copy from 'fast-copy';

import { getZonesNames } from 'scripts/dbUtils';
import { ConsumerProfile, getTotalConsumption, getTotalProduction } from 'scripts/api';

const formatter = new Intl.NumberFormat();

interface Data {
	nbOfStations: number; // Number of charging stations in the zone
	nbOfChargingPoints: number; // Number of charging points in the zone
}

interface Props {
	zoneName: string; // Name of the selected zone
}

interface State {
	districtData: Data;
	zonesData: { [name: string]: Data };
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
				nbOfChargingPoints: 12,
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
		return this.props.zoneName !== null
			? this.state.zonesData[this.props.zoneName]
			: this.state.districtData;
	}

	render() {
		const data = this.currentData;
		const title = this.props.zoneName ?? 'Quartier de la Bastide';
		const nbStations = formatter.format(data.nbOfStations);
		const nbChargingPoints = formatter.format(data.nbOfChargingPoints);
		const plural: boolean = data.nbOfStations > 1;
		const district: boolean = this.props.zoneName === null;

		return (
			<div id="charging-stations-info-wrapper">
				<div id="charging-stations-info">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : `${title}`}</strong> compte <strong>{nbStations}&nbsp;station{plural ? 's' : ''}</strong> de recharge électrique pour <strong>{nbChargingPoints}&nbsp;borne{plural ? 's' : ''}</strong> au total.
					</p>
				</div>
			</div>
		);
	}
}
