import './DataContainer.css';
import React from 'react';

import { IndicatorType, IndicatorClass } from 'constants/indicator';
import { MapContainer, IndicatorContainer } from 'containers';
import { ConsumerProfile } from 'scripts/api';

interface State {
    selectedZoneName: string | null, // Zone seletected for the indicators, null means the entire district
    highlightedZoneName: string | null, // Zone that is currently highlighted on the map
    indicatorType: IndicatorType, // Type of indicator selected
    indicatorClass: IndicatorClass, // Class of indicator selected
    buildingType: ConsumerProfile, // Type of building selected
    t1: Date, // Starting date for indicators
    t2: Date, // Ending date for indicators
}

/**
 * Data container
 * 
 * Contains the map container and the indicators container.
 */
export default class DataContainer extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
            indicatorType: IndicatorType.DistrictEnergyBalance,
            indicatorClass: IndicatorClass.Global,
            buildingType: ConsumerProfile.ALL,
            t1: new Date('2021-12-01T00:30:00Z'),
            t2: new Date('2021-12-31T00:30:00Z'),
            highlightedZoneName: null,
        };
    }

    render() {
        return (
            <div id="data-container">
                <div id="map-container">
                    <MapContainer
                        t1={this.state.t1}
                        t2={this.state.t2}
                        indicatorClass={this.state.indicatorClass}
                        highlightedZoneName={this.state.highlightedZoneName}
                    />
                </div>
                <IndicatorContainer
                    zoneName={this.state.selectedZoneName}
                    setZoneName={(zoneName: string | null) => this.setState((state) => ({ ...state, selectedZoneName: zoneName }))}
                    indicatorType={this.state.indicatorType}
                    setIndicatorType={(indicatorType: IndicatorType) => this.setState((state) => ({ ...state, indicatorType: indicatorType }))}
                    setIndicatorClass={(indicatorClass: IndicatorClass) => this.setState((state) => ({ ...state, indicatorClass: indicatorClass }))}
                    buildingType={this.state.buildingType}
                    setBuildingType={(buildingType: ConsumerProfile) => this.setState((state) => ({ ...state, buildingType: buildingType }))}
                    t1={this.state.t1}
                    setT1={(t1: Date) => this.setState((state) => ({ ...state, t1: t1 }))}
                    t2={this.state.t2}
                    setT2={(t2: Date) => this.setState((state) => ({ ...state, t2: t2 }))}
                    setHighlightedZone={(zoneName: string | null) => this.setState((state) => ({ ...state, highlightedZoneName: zoneName }))}
                />
            </div>
        );
    }
}
