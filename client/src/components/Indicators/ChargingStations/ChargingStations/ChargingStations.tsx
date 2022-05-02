import './ChargingStations.css';

import React from 'react';

import { getZonesNames, getZoneChargingStationsData } from 'scripts/dbUtils';

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
				nbOfStations: 0,
				nbOfChargingPoints: 0
			},
			zonesData: {},
		};

		for (const zoneName of getZonesNames()) {
			this.state.zonesData[zoneName] = {
				nbOfStations: getZoneChargingStationsData(zoneName).nbOfStations,
				nbOfChargingPoints: getZoneChargingStationsData(zoneName).nbOfChargingPoints,
			};

			this.state.districtData.nbOfStations += this.state.zonesData[zoneName].nbOfStations;
			this.state.districtData.nbOfChargingPoints += this.state.zonesData[zoneName].nbOfChargingPoints;
		}
	}

	async componentDidMount() {
	}

	private get currentData(): Data {
		return this.props.zoneName !== null
			? this.state.zonesData[this.props.zoneName]
			: this.state.districtData;
	}

	render() {
		const { nbOfStations, nbOfChargingPoints } = this.currentData;
		const title = this.props.zoneName ?? 'Quartier de la Bastide';
		const district: boolean = this.props.zoneName === null;

		return (
				<div id="charging-stations-info" className="text-indicator">
					<p>
						{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : `${title}`}</strong> compte <strong>{nbOfStations}&nbsp;station{nbOfStations > 1 ? 's' : ''}</strong> de recharge électrique pour <strong>{nbOfChargingPoints}&nbsp;borne{nbOfChargingPoints > 1 ? 's' : ''}</strong> au total.
					</p>
				</div>
		);
	}
}
