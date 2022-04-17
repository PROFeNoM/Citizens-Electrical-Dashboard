import React from 'react';
import { DistrictEnergyBalance, ChargingStationIndicator } from '..'
import { Indicator } from '../../pages/Home/HomeUtils'
import { TypicalProductionDay, TypicalConsumptionDay, ConsumptionDonut, SolarDonut, WeeklyProduction } from '..'
import { ConsumerProfile } from '../../scripts/api';
import TotalConsumption from '../TotalConsumption/TotalConsumption';
import LocalProductionInfo from '../LocalProductionInfo/LocalProductionInfo';

interface Props {
    selectedZoneName: string | null,
    indicatorType: Indicator
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date,
    setHighlightedZone: (val: string | null) => void
}


export default class DataContainer extends React.Component<Props> {
    render() {
        switch(this.props.indicatorType){
            case Indicator.DistrictEnergyBalance:
                return (
                    <DistrictEnergyBalance
                        selectedZoneName={this.props.selectedZoneName}
                        />
                );
            case Indicator.TypicalConsumptionDay:
                return (
                    <TypicalConsumptionDay 
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        buildingType={this.props.buildingType}
                        title={"Journée type de consommation"}
                    />
                );
            case Indicator.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Journée type de production"}
                    />
                );
            case Indicator.TotalConsumption:
                return (
                    <TotalConsumption 
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Consommation totale"}
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
            default:
                return (
                    <DistrictEnergyBalance
                        selectedZoneName={this.props.selectedZoneName}
                        />
                );
        }
    }
}