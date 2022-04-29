import './IndicatorViewer.css';

import React from 'react';

import { IndicatorType, getIndicator } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import {
    EnergyBalance,
    TypicalConsumptionDay, ConsumptionDonut, TotalConsumption,
    LocalProductionInfo, TypicalProductionDay, SolarDonut, WeeklyProduction,
    ChargingStations
} from 'components/Indicators';

interface Props {
    zoneName: string | null;
    indicatorType: IndicatorType;
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

    renderIndicator(indicatorType: IndicatorType) {
        switch (indicatorType) {
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
                    />
                );
        }
    }

    render() {
        const indicator = getIndicator(this.props.indicatorType);
        return (
            <div id="indicator-wrapper">
                <h2 id="indicator-name">{indicator.name}</h2>
                <div id="indicator-content">
                    {this.renderIndicator(indicator.type)}
                </div>
            </div>
        );
    }
}
