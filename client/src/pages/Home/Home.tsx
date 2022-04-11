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
                            <Select style={dropdownStyle} multi={false} placeholder={"Quartier"} options={selectOptionsDist} onChange={(values) => this.setState({selectedZoneName: values[0].label})} values={[]}/>
                            <Select clearable={true} style={dropdownStyle} multi={false} placeholder={"Bâtiment"} options={selectOptionsBuild} onChange={(values) => this.setState({buildingType: values[0].value})} values={[]}/>
                            <DatePicker className="date-picker" value={this.state.t1} onChange={(value) => this.setState({t1: value})}/>
                            <Select style={dropdownStyle} multi={false} placeholder={"Information"} options={selectOptionsInf} onChange={(values) => this.setState({infoType: values[0].value})} values={[]}/>
                            <Select style={dropdownStyle} multi={false} placeholder={"Indicateur"} options={selectOptionsInd} onChange={(values) => this.setState({indicatorType: values[0].value})} values={[]}/>
                            <DatePicker className="date-picker" value={this.state.t2} onChange={(value) => this.setState({t2: value})}/>
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
