import React from 'react';
import { DistrictEnergyBalance,ChargingStationIndicator } from '../../components'
import { Indicator, Information } from '../../pages/Home/HomeUtils'
import { TypicalConsumptionDay, ConsumptionDonut, SolarDonut, WeeklyProduction } from '../../components'
import { ConsumerProfile } from '../../scripts/api';

interface Props {
    selectedZoneName: string | null,
    indicatorType: Indicator
    buildingType: ConsumerProfile,
    infoType: Information,
    t1: Date,
    t2: Date
}


export default class DataContainer extends React.Component<Props> {
    constructor(props: Props){
        super(props);
    }

    render() {
        switch(this.props.indicatorType){
            case Indicator.InformationsGlobales:
                return (
                    <DistrictEnergyBalance
                        selectedZoneName={this.props.selectedZoneName}
                        />
                )
            case Indicator.Consommation:
                switch(this.props.infoType){
                    case Information.JourneeType:
                        return (
                            <TypicalConsumptionDay 
                                t1={this.props.t1.getTime()}
                                t2={this.props.t2.getTime()}
                                urbanZone={this.props.selectedZoneName}
                                buildingType={this.props.buildingType}
                                title={"Journée type de consomation"}
                            />
                        )
                    case Information.VueGlobale:
                        return (
                            <ConsumptionDonut
                                t1={this.props.t1.getTime()}
                                t2={this.props.t2.getTime()}
                                urbanZone={this.props.selectedZoneName}
                                buildingType={this.props.buildingType}
                                title={"Evolution de la consommation"}
                            />
                        )
                }
                case Indicator.Production:
                    switch(this.props.infoType){
                        case Information.JourneeType:
                            return (
                                <SolarDonut 
                                    t1={this.props.t1.getTime()}
                                    t2={this.props.t2.getTime()}
                                    urbanZone={this.props.selectedZoneName}
                                    title={"Production globale"}
                                />
                            )
                        case Information.VueGlobale:
                            return (
                                <WeeklyProduction 
                                    t1={this.props.t1.getTime()}
                                    t2={this.props.t2.getTime()}
                                    urbanZone={this.props.selectedZoneName}
                                    title={"Production Hebdomadaire"}
                                />
                            )
                    }
                case Indicator.BornesDeRecharge:
                    return (
                        <ChargingStationIndicator
                        selectedZoneName={this.props.selectedZoneName}
                        />
                    )
        }
    }
}