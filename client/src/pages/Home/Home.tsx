import './Home.css';
import { Header } from '../../containers';
import { HomeMap } from '../../components';
import React from 'react';
import Select from 'react-dropdown-select';
import { 
    Indicator,
    Information,
    dropdownStyle,
    selectOptionsBuild, 
    selectOptionsDist, 
    selectOptionsInd, 
    selectOptionsInf
} from './HomeUtils';

import DatePicker from 'react-date-picker';
import DataContainer from '../../components/DataContainer/DataContaineur';
import { ConsumerProfile } from '../../scripts/api';
import { Button } from '@mui/material';

interface State {
    selectedZoneName: string | null,
    indicatorType: Indicator
    buildingType: ConsumerProfile,
    infoType: Information,
    t1: Date,
    t2: Date
}

export default class Home extends React.Component<{}, State>{
    private mapRef = React.createRef<HomeMap>();

    private temporaryState: State;

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
            indicatorType: Indicator.InformationsGlobales,
            buildingType: ConsumerProfile.ALL,
            infoType: Information.VueGlobale,
            t1: new Date('2021-12-01T00:30:00Z'),
            t2: new Date('2021-12-31T00:30:00Z')

        };
        this.temporaryState = this.state;
    
        this.validateRequest = this.validateRequest.bind(this);
    }

    validateRequest() {

        console.log(this.temporaryState);
        console.log("JE SUIS BIEN LA");
        if (this.temporaryState.selectedZoneName == "Quartier de la Bastide")
            this.setState({selectedZoneName: null});
        else   
            this.setState({selectedZoneName: this.temporaryState.selectedZoneName});
       
        this.setState({indicatorType: this.temporaryState.indicatorType});
        this.setState({buildingType: this.temporaryState.buildingType});
        this.setState({infoType: this.temporaryState.infoType});
        this.setState({t1: this.temporaryState.t1});
        this.setState({t2: this.temporaryState.t2});        
        console.log(this.state);
    }


    render() {

        return (
            <div id='home-container'>
                <Header title='Tableau éléctrique citoyen' />
                <main>
                    <HomeMap
                        ref={this.mapRef}
                        onZoneClick={zoneName => this.setState({ selectedZoneName: zoneName })}
                    />
                    <div>
                        <div className="dropdown-wrapper">
                            <Select onChange={(values) => {if(values.length !== 0) this.temporaryState.selectedZoneName = values[0].label}} clearable={true} style={dropdownStyle} multi={false} placeholder={"Quartier"} options={selectOptionsDist} values={[]}/>
                            <Select onChange={(values) =>  {if(values.length !== 0) this.temporaryState.buildingType = values[0].value}} clearable={true} style={dropdownStyle} multi={false} placeholder={"Bâtiment"} options={selectOptionsBuild} values={[]}/>
                            <DatePicker className="date-picker" value={this.temporaryState.t1} onChange={(value) => this.temporaryState.t1 = value}/>
                            <Select onChange={(values) => {if(values.length !== 0) this.temporaryState.infoType = values[0].value}} clearable={true} style={dropdownStyle} multi={false} placeholder={"Information"} options={selectOptionsInf} values={[]}/>
                            <Select onChange={(values) => {if(values.length !== 0) this.temporaryState.indicatorType = values[0].value}} clearable={true} style={dropdownStyle} multi={false} placeholder={"Indicateur"} options={selectOptionsInd} values={[]}/>
                            <DatePicker className="date-picker" value={this.temporaryState.t2} onChange={(value) => this.temporaryState.t2 = value}/>
                            <Button onClick={this.validateRequest}>OK</Button>
                        </div>
                        <DataContainer
                            selectedZoneName={this.state.selectedZoneName}
                            indicatorType={this.state.indicatorType}
                            buildingType={this.state.buildingType}
                            infoType={this.state.infoType}
                            t1={this.state.t1}
                            t2={this.state.t2}
                        />
                    </div>
                </main>
            </div>
        );
    }
}
