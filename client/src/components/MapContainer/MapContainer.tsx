import React from 'react';
import { IndicatorClass } from '../../pages/Home/HomeUtils';
import { HomeMap } from '../../components';
import ConsumptionChoroplethMap from '../Maps/ConsumptionChoroplethMap/ConsumptionChoroplethMap';
import ProductionChoroplethMap from '../Maps/ProductionChoroplethMap/ProductionChoroplethMap';

interface Props {
    t1: Date,
    t2: Date,
    indicatorClass: IndicatorClass,
    highlightedZoneName: string | null,
}

export default class MapContainer extends React.Component<Props> {
    render() {
        switch (this.props.indicatorClass) {
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
            case IndicatorClass.Global:
            default:
                return (
                    <HomeMap />
                );
        }
    }
}
