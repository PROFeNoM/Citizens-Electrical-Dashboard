import './BalanceMap.css';
import React from 'react';
import UrbanZoneMap from '../UrbanZonesMap/UrbanZoneMap';
import { FeatureCollection } from 'geojson';

interface Props {
	currentZone: string,
}

export default class BalanceMap extends React.Component<Props, {}> {
	private async zoneTransformer(zones: FeatureCollection): Promise<FeatureCollection> {
		return {
			type: 'FeatureCollection',
			features: zones.features.map(zone => ({
				...zone,
				properties: {
					...zone.properties,
					currentZone: zone.properties.libelle === this.props.currentZone,
				},
			}))
		};
	}

	render() {
		return (
			<div className='balance-map-wrapper'>
				<div id="BalanceMap" className="balance-map">
					<UrbanZoneMap
						zonesTransformer={zones => this.zoneTransformer(zones)}
						zonesFillColor={[
							'case',
							['get', 'currentZone'],
							'#005eb8',
							'#7fd1ef',
						]}
					/>
				</div>
			</div>
		);
	}
}
