import './IndicatorContainer.css';

import React from 'react';

import IndicatorMenu from './IndicatorMenu';
import IndicatorViewer from './IndicatorViewer';
import { IndicatorType, IndicatorClass } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';

interface Props {
    zoneName: string | null,
    setZoneName: (val: string | null) => void,
    indicatorType: IndicatorType,
    setIndicatorType: (val: IndicatorType) => void,
    setIndicatorClass: (val: IndicatorClass) => void,
    buildingType: ConsumerProfile,
    setBuildingType: (val: ConsumerProfile) => void,
    t1: Date,
    setT1: (val: Date) => void,
    t2: Date,
    setT2: (val: Date) => void,
    setHighlightedZone: (val: string | null) => void,
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
                <IndicatorMenu
                    setZoneName={this.props.setZoneName}
                    setIndicatorType={this.props.setIndicatorType}
                    setIndicatorClass={this.props.setIndicatorClass}
                    setBuildingType={this.props.setBuildingType}
                    setT1={this.props.setT1}
                    setT2={this.props.setT2}
                    setHighlightedZone={this.props.setHighlightedZone}
                 />
                <IndicatorViewer
                    zoneName={this.props.zoneName}
                    indicatorType={this.props.indicatorType}
                    buildingType={this.props.buildingType}
                    t1={this.props.t1}
                    t2={this.props.t2}
                    setHighlightedZone={this.props.setHighlightedZone}
                />
            </div>
        );
    }
}
