import './BalanceMap.css';
import React from 'react';
import { updateProperties } from './utils';
import UrbanZoneMap from '../BaseMap/UrbanZoneMap';

interface Props {
	currentZone: string,
}

export default class BalanceMap extends React.Component<Props, {}> {
	render() {
		return (
			<div className='balance-map-wrapper'>
				<div id="BalanceMap" className="balance-map">
					<UrbanZoneMap
						zonesTransformer={zones => updateProperties(
							zones,
							this.props.currentZone,
						)}
						zonesFillColor={{
							property: 'curentZone',
							stops: [
								[0, '#7fd1ef'],
								[1, '#005eb8'],
							]
						}}
					/>
				</div>
			</div>
		);
	}
}
