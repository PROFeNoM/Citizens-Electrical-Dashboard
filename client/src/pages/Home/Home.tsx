import './Home.css';
import { Header } from '../../containers';
import { DistrictEnergyBalance } from '../../components';
import UrbanZoneMap from '../../components/Maps/UrbanZonesMap/UrbanZoneMap';
import React from 'react';

function Home() {
    return (
        <div id='home-container'>
            <Header title='ACCUEIL' />
            <main>
                <UrbanZoneMap
                    center={[-0.5564, 44.8431]}
                    bounds={[
                        [-0.5463, 44.8522],
                        [-0.5665, 44.8382],
                    ]}
                    zoom={15.5}
                    pitch={42}
                    onZoneClick={x => console.log(x)}
                />
                <DistrictEnergyBalance/>
            </main>
        </div>
    );
}

export default Home;
