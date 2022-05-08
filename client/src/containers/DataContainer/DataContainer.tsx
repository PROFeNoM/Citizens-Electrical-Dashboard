import './DataContainer.css';
import React from 'react';

import { Indicator, IndicatorType, getIndicatorFromType } from 'constants/indicators';
import { ConsumerProfile } from 'constants/profiles';
import { MapContainer, IndicatorContainer } from 'containers';

interface State {
    indicator: Indicator; // Indicator selected
    zoneName: string | null; // Zone seletected for the indicators, null means the entire district
    highlightedZoneName: string | null; // Zone that is currently highlighted on the map
    buildingType: ConsumerProfile; // Type of building selected
    t1: Date; // Starting date for indicators
    t2: Date; // Ending date for indicators
}

/**
 * Data container
 * 
 * Contains the map container and the indicators container.
 */
export default class DataContainer extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const today: Date = new Date();

        this.state = {
            indicator: getIndicatorFromType(IndicatorType.EnergyBalance),
            zoneName: null,
            buildingType: ConsumerProfile.ALL,
            t1: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 365), // 1 year ago
            t2: today,
            highlightedZoneName: null
        };
    }

    render() {
        return (
            <div id="data-container">
                <div id="map-container-wrapper" key={this.state.t1.toString()+this.state.t2.toString()}>
                    <MapContainer
                        t1={this.state.t1}
                        t2={this.state.t2}
                        indicator={this.state.indicator}
                        highlightedZoneName={this.state.highlightedZoneName}
                        buildingType={this.state.buildingType}
                    />
                </div>
                <div id="indicator-container-wrapper">
                    <IndicatorContainer
                        indicator={this.state.indicator}
                        setIndicator={(indicator: Indicator) => this.setState((state) => ({ ...state, indicator }))}
                        zoneName={this.state.zoneName}
                        setZoneName={(zoneName: string | null) => this.setState((state) => ({ ...state, zoneName }))}
                        buildingType={this.state.buildingType}
                        setBuildingType={(buildingType: ConsumerProfile) => this.setState((state) => ({ ...state, buildingType }))}
                        t1={this.state.t1}
                        setT1={(t1: Date) => this.setState((state) => ({ ...state, t1 }))}
                        t2={this.state.t2}
                        setT2={(t2: Date) => this.setState((state) => ({ ...state, t2 }))}
                        setHighlightedZone={(highlightedZoneName: string | null) => this.setState((state) => ({ ...state, highlightedZoneName }))}
                    />
                </div>
            </div>
        );
    }
}
