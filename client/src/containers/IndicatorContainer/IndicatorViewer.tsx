import './IndicatorViewer.css';

import React from 'react';

import { Indicator, IndicatorType } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import {
    EnergyBalance,
    TypicalConsumptionDay, ConsumptionDonut, TotalConsumption,
    LocalProductionInfo, TypicalProductionDay, SolarDonut, WeeklyProduction,
    ChargingStations
} from 'components/Indicators';

interface Props {
    indicator: Indicator;
    zoneName: string | null;
    buildingType: ConsumerProfile;
    t1: Date;
    t2: Date;
    setHighlightedZone: (val: string | null) => void;
}

export default class IndicatorViewer extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);

        this.renderIndicator = this.renderIndicator.bind(this);
    }

    /**
     * Return the component corresponding to the indicator given.
     * 
     * @param indicator The indicator to render
     * @returns The component corresponding to the given indicator
     */
    renderIndicator(indicator: Indicator) {
        switch (indicator.type) {
            case IndicatorType.TypicalConsumptionDay:
                return (
                    <TypicalConsumptionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        buildingType={this.props.buildingType}
                        title={'Journée type de consommation'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.TotalConsumption:
                return (
                    <TotalConsumption
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        title={'Consommation totale'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.ConsumptionDonut:
                return (
                    <ConsumptionDonut
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        buildingType={this.props.buildingType}
                        title={'Evolution de la consommation'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.LocalProductionInfo:
                return (
                    <LocalProductionInfo
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        title={'Production locale'}
                    />
                );
            case IndicatorType.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        title={'Journée type de production'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.SolarDonut:
                return (
                    <SolarDonut
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        title={'Production globale'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.WeeklyProduction:
                return (
                    <WeeklyProduction
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.zoneName}
                        title={'Production hebdomadaire'}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.ChargingStations:
                return (
                    <ChargingStations
                        zoneName={this.props.zoneName}
                    />
                );
            case IndicatorType.EnergyBalance:
            default:
                return (
                    <EnergyBalance
                        zoneName={this.props.zoneName}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
        }
    }

    render() {
        return (
            <div id="indicator-viewer">
                <div id="indicator-name-wrapper">
                    <p>{this.props.indicator.name}</p>
                </div>
                <div id="indicator-content">
                    {this.renderIndicator(this.props.indicator)}
                </div>
            </div>
        );
    }
}
