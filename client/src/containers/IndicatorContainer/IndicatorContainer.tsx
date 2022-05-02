import './IndicatorContainer.css';

import React from 'react';

import IndicatorMenu from './IndicatorMenu';
import IndicatorViewer from './IndicatorViewer';
import { Indicator } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';

interface Props {
    indicator: Indicator;
    setIndicator: (indicator: Indicator) => void;
    zoneName: string | null;
    setZoneName: (val: string | null) => void;
    buildingType: ConsumerProfile;
    setBuildingType: (val: ConsumerProfile) => void;
    t1: Date;
    setT1: (val: Date) => void;
    t2: Date;
    setT2: (val: Date) => void;
    setHighlightedZone: (val: string | null) => void;
}

/**
 * Indicators container
 * 
 * Contains the indicator menu and the indicator itself.
 */
export default class IndicatorContainer extends React.Component<Props, {}> {
    render() {
        return (
            <div id="indicator-container">
                <div id="indicator-menu-wrapper">
                    <IndicatorMenu
                        setIndicator={this.props.setIndicator}
                        setZoneName={this.props.setZoneName}
                        setBuildingType={this.props.setBuildingType}
                        setT1={this.props.setT1}
                        setT2={this.props.setT2}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                </div>
                <div id="indicator-viewer-wrapper">
                    <IndicatorViewer
                        indicator={this.props.indicator}
                        zoneName={this.props.zoneName}
                        sector={this.props.buildingType}
                        t1={this.props.t1}
                        t2={this.props.t2}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                </div>
            </div>
        );
    }
}
