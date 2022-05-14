import './ChargingStations.css';

import React from 'react';

import { getZoneChargingStationsData, getZonesNames } from 'scripts/dbUtils';

interface Props {
	zoneName: string; // Name of the current zone
}

interface State {
	nbOfStations: number; // Number of charging stations in the zone
	nbOfChargingPoints: number; // Number of charging points in the zone
}

/**
 * Textual indicator that displays the number of charging stations
 * and charging points in the zone.
 */
export default class ChargingStationIndicator extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			nbOfStations: null,
			nbOfChargingPoints: null
		};
	}

	private async fetchData(): Promise<void> {
		const { zoneName } = this.props;
		const zoneNames = await getZonesNames();

		const { nbOfStations, nbOfChargingPoints } = zoneName === null ?
			(await Promise.all(zoneNames.map(getZoneChargingStationsData))).reduce((a, b) => ({
				nbOfStations: a.nbOfStations + b.nbOfStations,
				nbOfChargingPoints: a.nbOfChargingPoints + b.nbOfChargingPoints
			}))
			: await getZoneChargingStationsData(zoneName);

		this.setState({
			nbOfStations,
			nbOfChargingPoints
		});
	}

	async componentDidMount(): Promise<void> {
		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	async componentDidUpdate(prevProps: Readonly<Props>): Promise<void> {
		if (prevProps.zoneName === this.props.zoneName) {
			return;
		}

		try {
			await this.fetchData();
		} catch (e) {
			console.error('Error while fetching data', e);
		}
	}

	render() {
		const { nbOfStations, nbOfChargingPoints } = this.state;
		const title = this.props.zoneName ?? 'Quartier de la Bastide';
		const district: boolean = this.props.zoneName === null;

		if (nbOfStations === null || nbOfChargingPoints === null) {
			return (
				<div id="charging-stations-info" className="text-indicator">
					<p>
						Chargement...
					</p>
				</div>
			);
		}

		if (nbOfStations === 0) {
			return (
				<div id="charging-stations-info" className="text-indicator">
					<p>
						Il n'y a pas de stations de recharge électrique dans {district ? 'le quartier' : 'la zone'} <strong>{district ? 'Bastide' : `${title}`}</strong>.
					</p>
				</div>
			);
		}

		return (
			<div id="charging-stations-info" className="text-indicator">
				<p>
					{district ? 'Le quartier' : 'La zone'} <strong>{district ? 'Bastide' : `${title}`}</strong> compte <strong>{nbOfStations}&nbsp;station{nbOfStations > 1 ? 's' : ''}</strong> de recharge électrique pour <strong>{nbOfChargingPoints}&nbsp;borne{nbOfChargingPoints > 1 ? 's' : ''}</strong> au total.
				</p>
			</div>
		);
	}
}
