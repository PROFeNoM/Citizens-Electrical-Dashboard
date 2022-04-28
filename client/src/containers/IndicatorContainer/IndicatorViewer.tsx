import './IndicatorViewer.css';

import React from 'react';

import { IndicatorType } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import {
    EnergyBalance, ChargingStationIndicator,
    TypicalConsumptionDay, ConsumptionDonut, TotalConsumption,
    LocalProductionInfo, TypicalProductionDay, SolarDonut, WeeklyProduction
} from 'components/Indicators';

interface Props {
    selectedZoneName: string | null,
    indicatorType: IndicatorType
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date,
    setHighlightedZone: (val: string | null) => void
}

export default class IndicatorViewer extends React.Component<Props> {
    render() {
        <div id="indicator-wrapper"></div>
        switch (this.props.indicatorType) {
            case IndicatorType.TypicalConsumptionDay:
                return (
                    <TypicalConsumptionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        buildingType={this.props.buildingType}
                        title={"Journée type de consommation"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Journée type de production"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.TotalConsumption:
                return (
                    <TotalConsumption
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Consommation totale"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.ConsumptionDonut:
                return (
                    <ConsumptionDonut
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        buildingType={this.props.buildingType}
                        title={"Evolution de la consommation"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.SolarDonut:
                return (
                    <SolarDonut
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production globale"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.WeeklyProduction:
                return (
                    <WeeklyProduction
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production Hebdomadaire"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case IndicatorType.LocalProductionInfo:
                return (
                    <LocalProductionInfo
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production locale"}
                    />
                );
            case IndicatorType.DistrictEnergyBalance:
            default:
                return (
                    <EnergyBalance
                        selectedZoneName={this.props.selectedZoneName}
                    />
                );
        }
    }
}
