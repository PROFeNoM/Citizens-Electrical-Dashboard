import './MapContainer.css';

import React from 'react';

import { ConsumerProfile } from 'constants/profiles';
import { Indicator } from 'constants/indicators';
import { UrbanZonesMap } from 'components/Maps';

interface Props {
    indicator: Indicator;
    t1: Date;
    t2: Date;
    buildingType: ConsumerProfile;
    highlightedZoneName: string | null;
}

/**
 * Map container
 * 
 * Change the map to display based on the indicator class.
 */
export default class MapContainer extends React.Component<Props> {
    render() {
        return (
            <div id="map-container">
                <UrbanZonesMap
                    indicator={this.props.indicator}
                    buildingType={this.props.buildingType}
                    highlightedZoneName={this.props.highlightedZoneName}
                    t1={this.props.t1.getTime()}
                    t2={this.props.t2.getTime()}
                />
            </div>
        );
    }
}
