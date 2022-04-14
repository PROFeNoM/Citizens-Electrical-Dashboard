import React from 'react';
import { DistrictEnergyBalance,ChargingStationIndicator } from '../../components'
import { Indicator } from '../../pages/Home/HomeUtils'
import { TypicalConsumptionDay, ConsumptionDonut, SolarDonut, WeeklyProduction } from '../../components'
import { ConsumerProfile } from '../../scripts/api';
import LocalProductionInfo from '../LocalProductionInfo/LocalProductionInfo';
import TotalConsumption from '../TotalConsumption/TotalConsumption';

interface Props {
    selectedZoneName: string | null,
    indicatorType: Indicator
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date
}


export default class DataContainer extends React.Component<Props> {
    constructor(props: Props){
        super(props);
    }

    

    render() {
        console.log(this.props);
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
                        title={"Journée type de consomation"}
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
                    />
                );
            case Indicator.SolarDonut:
                return (
                    <SolarDonut 
                        t1={this.props.t1.getTime()}
                        t2={this.props.t2.getTime()}
                        urbanZone={this.props.selectedZoneName}
                        title={"Production globale"}
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
                )
        }
    }
}