import './IndicatorContainer.css';

import React from 'react';

import { Indicator } from 'constants/indicators';
import { ConsumerProfile } from 'constants/profiles';
import IndicatorMenu from './IndicatorMenu';
import IndicatorViewer from './IndicatorViewer';

interface Props {
	indicator: Indicator; // Selected indicator
	setIndicator: (indicator: Indicator) => void; // Function to set the selected indicator
	zoneName: string | null; // Name of the selected zone
	setZoneName: (val: string | null) => void; // Function to set the selected zone
	consumerProfile: ConsumerProfile; // Selected consumer profile
	setConsumerProfile: (val: ConsumerProfile) => void; // Function to set the selected consumer profile
	t1: Date; // Start time of the current period (Unix milliseconds)
	setT1: (val: Date) => void; // Function to set the start time of the current period
	t2: Date; // End time of the current period (Unix milliseconds)
	setT2: (val: Date) => void; // Function to set the end time of the current period
	setHighlightedZone: (val: string | null) => void; // Function to set the highlighted zone
}

/**
 * Component that contains the indicator menu and the indicator viewer.
 * 
 * @see IndicatorMenu
 * @see IndicatorViewer
 */
export default class IndicatorContainer extends React.Component<Props, {}> {
	render() {
		return (
			<div id="indicator-container">
				<div id="indicator-menu-wrapper">
					<IndicatorMenu
						indicator={this.props.indicator}
						setIndicator={this.props.setIndicator}
						zoneName={this.props.zoneName}
						setZoneName={this.props.setZoneName}
						consumerProfile={this.props.consumerProfile}
						setConsumerProfile={this.props.setConsumerProfile}
						t1={this.props.t1}
						setT1={this.props.setT1}
						t2={this.props.t2}
						setT2={this.props.setT2}
						setHighlightedZone={this.props.setHighlightedZone}
					/>
				</div>
				<div id="indicator-viewer-wrapper">
					<IndicatorViewer
						indicator={this.props.indicator}
						zoneName={this.props.zoneName}
						consumerProfile={this.props.consumerProfile}
						t1={this.props.t1}
						t2={this.props.t2}
						setHighlightedZone={this.props.setHighlightedZone}
					/>
				</div>
			</div>
		);
	}
}
