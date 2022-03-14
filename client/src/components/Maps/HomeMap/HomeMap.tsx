import './HomeMap.css';
import React from 'react';
import UrbanZoneMap from '../UrbanZonesMap/UrbanZoneMap';
import { DistrictEnergyBalance } from '../../index';

export default class HomeMap extends React.Component<{}, {}> {
	render() {
		return (
			<div id='home-map-container'>
				<UrbanZoneMap
					lng={-0.5564}
					lat={44.8431}
					zoom={15.5}
					pitch={42}
					interactive={false}
				/>
				<DistrictEnergyBalance/>
			</div>
		);
	}
}
