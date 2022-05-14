import './MapContainer.css';

import React from 'react';

import { ConsumerProfile } from 'constants/profiles';
import { Indicator } from 'constants/indicators';
import { UrbanZonesMap } from 'components/Maps';

interface Props {
	indicator: Indicator; // Selected indicator
	t1: Date; // Start time of the current period (Unix milliseconds)
	t2: Date; // End time of the current period (Unix milliseconds)
	consumerProfile: ConsumerProfile; // Selected consumer profile
	highlightedZoneName: string | null; // Name of the highlighted zone
}

/**
 * Component that contains the map.
 * 
 * @see UrbanZonesMap
 */
export default class MapContainer extends React.Component<Props> {
	render() {
		return (
			<div id="map-container">
				<UrbanZonesMap
					indicator={this.props.indicator}
					consumerProfile={this.props.consumerProfile}
					highlightedZoneName={this.props.highlightedZoneName}
					t1={this.props.t1.getTime()}
					t2={this.props.t2.getTime()}
				/>
			</div>
		);
	}
}
