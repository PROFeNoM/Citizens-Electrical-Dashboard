import React from 'react';
import { Indicator, IndicatorClass } from 'constants/indicator';
import { HomeMap, ConsumptionChoroplethMap, ProductionChoroplethMap } from 'components/Maps';

interface Props {
    indicator: Indicator;
    t1: Date;
    t2: Date;
    highlightedZoneName: string | null;
}

/**
 * Map container
 * 
 * Change the map to display based on the indicator class.
 */
export default class MapContainer extends React.Component<Props> {
    render() {
        switch (this.props.indicator.class) {
            case IndicatorClass.Production:
                return (
                    <ProductionChoroplethMap
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        highlightedZoneName={this.props.highlightedZoneName}
                    />
                );
            case IndicatorClass.Consumption:
                return (
                    <ConsumptionChoroplethMap
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        highlightedZoneName={this.props.highlightedZoneName}
                    />
                );
            case IndicatorClass.General:
            default:
                return (
                    <HomeMap />
                );
        }
    }
}
