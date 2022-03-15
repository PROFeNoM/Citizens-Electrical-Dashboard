import './HomeMap.css';
import React from 'react';
import UrbanZoneMap from '../UrbanZonesMap/UrbanZoneMap';
import { DistrictEnergyBalance } from '../../index';

export default class HomeMap extends React.Component<{}, {}> {
	render() {
		return (
			<div id='home-map-container'>
				<UrbanZoneMap
					center={[-0.5564, 44.8431]}
					bounds={[
						[-0.5463, 44.8522],
						[-0.5665, 44.8382],
					]}
					zoom={15.5}
					pitch={42}
				/>
				<DistrictEnergyBalance/>
			</div>
		);
	}
}
