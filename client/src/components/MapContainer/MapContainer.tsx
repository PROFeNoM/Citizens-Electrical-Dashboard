import React from 'react';
import { IndicatorClass } from '../../pages/Home/HomeUtils';
import { HomeMap } from '../../components';
import ProductionChoroplethMap from '../Maps/ProductionChoroplethMap/ProductionChoroplethMap';
import ConsumptionChoroplethMap from '../Maps/ConsumptionChoroplethMap/ConsumptionChoroplethMap';

interface Props {
	t1: Date,
	t2: Date,
    indicatorClass: IndicatorClass,
}


export default class MapContainer extends React.Component<Props> {


    constructor(props: Props){
        super(props);
    }

    render() {
        switch(this.props.indicatorClass){
            case IndicatorClass.Global:
                return (
                    <HomeMap/>
                )
            case IndicatorClass.Production:
                return (
                    <ProductionChoroplethMap 
                        t1={this.props.t1.getTime()} 
                        t2={this.props.t2.getTime()}
                        />
                )
            case IndicatorClass.Consumption:
                return (
                    <ConsumptionChoroplethMap 
                        t1={this.props.t1.getTime()} 
                        t2={this.props.t2.getTime()}
                        />
                )
            default:
                return (
                    <HomeMap
                />
                )
        }
    }




}