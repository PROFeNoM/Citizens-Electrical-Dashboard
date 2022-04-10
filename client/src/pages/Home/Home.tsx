import './Home.css';
import { Header } from '../../containers';
import { DistrictEnergyBalance, HomeMap } from '../../components';
import React from 'react';
import Select from 'react-dropdown-select';


interface State {
    selectedZoneName: string | null,
}

export default class Home extends React.Component<{}, State>{
    private mapRef = React.createRef<HomeMap>();

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
        };
    }


    render() {

        const dropdownStyleBuild = {
            width: 200,
            'display': 'flex',
            'text-transform': 'uppercase'
        };

        const dropdownStyleDist = {
            width: 200,
            'display': 'flex',
            'text-transform': 'uppercase'
        };

        const selectOptionsBuild = [
            { value: 1, label: "Résidentiels"},
            { value: 2, label: "Tertiaires"},
            { value: 3, label: "Professionnels"},
        ];

        const selectOptionsDist = [
            { value: 1, label: "Bastide Niel"},
            { value: 2, label: "Historique"},
            { value: 3, label: "Sud"},
        ];

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
                            <Select style={dropdownStyleBuild} multi={true} placeholder={"Type de batiment"} options={selectOptionsBuild} onChange={() => console.log("Hello")} values={[]}/>
                            <Select style={dropdownStyleDist} multi={false} placeholder={"Quartier"} options={selectOptionsDist} onChange={() => console.log("Hello")} values={[]}/>
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
