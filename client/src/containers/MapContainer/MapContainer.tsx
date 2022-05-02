import './MapContainer.css';

import React from 'react';

import { ConsumerProfile } from 'constants/profiles';
import { Indicator } from 'constants/indicator';
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
                    highlightedZoneName={this.props.highlightedZoneName}
                    t1={this.props.t1.getTime()}
                    t2={this.props.t2.getTime()}
                    buildingType={this.props.buildingType}
                />
            </div>
        );
    }
}
