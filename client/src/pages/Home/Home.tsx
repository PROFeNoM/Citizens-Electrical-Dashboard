import './Home.css';
import { Header } from '../../containers';
import { HomeMap } from '../../components';
import React from 'react';
import {
    Indicator,
    IndicatorClass,
    selectOptionsBuild, 
    selectOptionsDist, 
    indicatorTree
} from './HomeUtils';

import DataContainer from '../../components/DataContainer/DataContaineur';
import { ConsumerProfile } from '../../scripts/api';
import { Button } from '@mui/material';
import { DatePicker, TreePicker } from 'rsuite';
import MapContainer from '../../components/MapContainer/MapContainer';

interface State {
    selectedZoneName: string | null,
    indicatorType: Indicator,
    indicatorClass: IndicatorClass,
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date
}

export default class Home extends React.Component<{}, State>{

    private temporaryState: State;

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
            indicatorType: Indicator.DistrictEnergyBalance,
            indicatorClass: IndicatorClass.Global,
            buildingType: ConsumerProfile.ALL,
            t1: new Date('2021-12-01T00:30:00Z'),
            t2: new Date('2021-12-31T00:30:00Z')

        };
        this.temporaryState = this.state;

        this.validateRequest = this.validateRequest.bind(this);
    }

    validateRequest() {
        if (this.temporaryState.selectedZoneName === "Quartier de la Bastide")
            this.setState({ selectedZoneName: null });
        else
            this.setState({ selectedZoneName: this.temporaryState.selectedZoneName });

        this.setState({ indicatorType: this.temporaryState.indicatorType });
        this.setState({ buildingType: this.temporaryState.buildingType });
        this.setState({ t1: this.temporaryState.t1 });
        this.setState({ t2: this.temporaryState.t2 });
        console.log(this.state);
    }

    render() {
        return (
            <div id='home-container'>
                <Header title='Tableau éléctrique citoyen' />
                <main>
                    <MapContainer 
                        t1={this.state.t1}
                        t2={this.state.t2}
                        indicatorClass={this.state.indicatorClass}
                    />
                    <div>
                        <div className="dropdown-wrapper">
                            <TreePicker onChange={(values: string) => { this.temporaryState.selectedZoneName = values }} className="TreePicker" data={selectOptionsDist} />
                            <TreePicker onChange={(values: ConsumerProfile) => { this.temporaryState.buildingType = values }} className="TreePicker" data={selectOptionsBuild} />
                            <TreePicker onChange={(values: Indicator) => this.temporaryState.indicatorType = values} className="TreePicker" data={indicatorTree} />
                            <div></div>
                            <DatePicker className="date-picker" onChange={(value) => this.temporaryState.t1 = value}/>
                            <DatePicker className="date-picker" onChange={(value) => this.temporaryState.t2 = value}/>
                            <Button className="val-button" variant="outlined" onClick={this.validateRequest}>OK</Button>
                        </div>
                        <DataContainer
                            selectedZoneName={this.state.selectedZoneName}
                            indicatorType={this.state.indicatorType}
                            buildingType={this.state.buildingType}
                            t1={this.state.t1}
                            t2={this.state.t2}
                        />
                    </div>
                </main>
            </div>
        );
    }
}
