import './Home.css';
import { Header } from '../../containers';
import { DistrictEnergyBalance, HomeMap } from '../../components';
import React from 'react';
import Select from 'react-dropdown-select';
import { 
    dropdownStyleBuild, 
    dropdownStyleDist, 
    dropdownStyleInd,
    dropdownStyleInf,
    selectOptionsBuild, 
    selectOptionsDist, 
    selectOptionsInd, 
    selectOptionsInf 
} from './HomeUtils';

import DatePicker from 'react-datepicker';


interface State {
    selectedZoneName: string | null,
    indicatorType: string | null,
    buildingType: string[] | null,
    infoType: string | null,
    t1: Date,
    t2: Date
}

export default class Home extends React.Component<{}, State>{
    private mapRef = React.createRef<HomeMap>();

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
            indicatorType: null,
            buildingType: null,
            infoType: null,
            t1: new Date('2021-12-01T00:30:00Z'),
            t2: new Date('2021-12-31T00:30:00Z')

        };
    }


    render() {

        return (
            <div id='home-container'>
                <Header title='ACCUEIL' />
                <main>
                    <HomeMap
                        ref={this.mapRef}
                        onZoneClick={zoneName => this.setState({ selectedZoneName: zoneName })}
                    />
                    <div>
                        <div className="dropdown-wrapper">
                            <Select style={dropdownStyleBuild} multi={true} placeholder={"Bâtiment"} options={selectOptionsBuild} onChange={(values) => console.log(values)} values={[]}/>
                            <Select style={dropdownStyleDist} multi={false} placeholder={"Quartier"} options={selectOptionsDist} onChange={(values) => console.log(values)} values={[]}/>
                            <Select style={dropdownStyleInd} multi={false} placeholder={"Indicateur"} options={selectOptionsInd} onChange={(values) => console.log(values)} values={[]}/>
                            <Select style={dropdownStyleInf} multi={false} placeholder={"Information"} options={selectOptionsInf} onChange={(values) => console.log(values)} values={[]}/>
                            <DatePicker selected={this.state.t1}/>
                            <DatePicker selected={this.state.t2}/>
                        </div>
                        <DistrictEnergyBalance
                            selectedZoneName={this.state.selectedZoneName}
                            onCancel={() => this.mapRef.current.unselectZone()}
                        />
                    </div>
                </main>
            </div>
        );
    }
}
