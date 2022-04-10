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

import DatePicker from 'react-date-picker';


interface State {
    selectedZoneName: string | null,
    indicatorType: string | null,
    buildingType: string[] | {value: number, label: string}[] | null,
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
                <Header title='Tableau éléctrique citoyen' />
                <main>
                    <HomeMap
                        ref={this.mapRef}
                        onZoneClick={zoneName => this.setState({ selectedZoneName: zoneName })}
                    />
                    <div>
                        <div className="dropdown-wrapper">
                            <Select style={dropdownStyleDist} multi={false} placeholder={"Quartier"} options={selectOptionsDist} onChange={(values) => this.setState({selectedZoneName: values[0].label})} values={[]}/>
                            <Select clearable={true} style={dropdownStyleBuild} multi={true} placeholder={"Bâtiment"} options={selectOptionsBuild} onChange={(values) => this.setState({buildingType: values})} values={[]}/>
                            <DatePicker className="date-picker" value={this.state.t1} onChange={(value) => this.setState({t1: value})}/>
                            <Select style={dropdownStyleInf} multi={false} placeholder={"Information"} options={selectOptionsInf} onChange={(values) => this.setState({infoType: values[0].label})} values={[]}/>
                            <Select style={dropdownStyleInd} multi={false} placeholder={"Indicateur"} options={selectOptionsInd} onChange={(values) => this.setState({indicatorType: values[0].label})} values={[]}/>
                            <DatePicker className="date-picker" value={this.state.t2} onChange={(value) => this.setState({t2: value})}/>
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
