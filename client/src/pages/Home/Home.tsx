import './Home.css';
import { Header } from '../../containers';
import { DistrictEnergyBalance, HomeMap } from '../../components';
import React from 'react';

interface State {
    selectedZoneName: string | null,
}

export default class Home extends React.Component<{}, State>{
    constructor(props) {
        super(props);
        this.state = {
            selectedZoneName: null,
        };
    }

    render() {
        return (
            <div id='home-container'>
                <Header title='ACCUEIL'/>
                <main>
                    <HomeMap
                        onZoneClick={zoneName => this.setState({ selectedZoneName: zoneName })}
                    />
                    <DistrictEnergyBalance
                        selectedZoneName={this.state.selectedZoneName}
                    />
                </main>
            </div>
        );
    }
}
