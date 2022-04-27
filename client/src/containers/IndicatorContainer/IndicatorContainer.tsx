import React from 'react';
import {
    EnergyBalance, ChargingStationIndicator,
    TypicalConsumptionDay, ConsumptionDonut, TotalConsumption,
    LocalProductionInfo, TypicalProductionDay, SolarDonut, WeeklyProduction
} from 'components/Indicators';
import { Indicator } from 'pages/Home/HomeUtils';
import { ConsumerProfile } from 'scripts/api';

interface Props {
    selectedZoneName: string | null,
    indicatorType: Indicator
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date,
    setHighlightedZone: (val: string | null) => void
}

export default class IndicatorContainer extends React.Component<Props> {
    render() {
        switch (this.props.indicatorType) {
            case Indicator.TypicalConsumptionDay:
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
            case Indicator.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Journée type de production"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case Indicator.TotalConsumption:
                return (
                    <TotalConsumption
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Consommation totale"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case Indicator.ConsumptionDonut:
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
            case Indicator.SolarDonut:
                return (
                    <SolarDonut
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production globale"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case Indicator.WeeklyProduction:
                return (
                    <WeeklyProduction
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production Hebdomadaire"}
                        setHighlightedZone={this.props.setHighlightedZone}
                    />
                );
            case Indicator.LocalProductionInfo:
                return (
                    <LocalProductionInfo
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production locale"}
                    />
                );
            case Indicator.DistrictEnergyBalance:
            default:
                return (
                    <EnergyBalance
                        selectedZoneName={this.props.selectedZoneName}
                    />
                );
        }
    }
}