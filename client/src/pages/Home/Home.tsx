import './Home.css';
import { Header } from '../../containers';
import { DistrictEnergyBalance, HomeMap } from '../../components';
import React from 'react';

function Home() {
    return (
        <div id='home-container'>
            <Header title='ACCUEIL' />
            <main>
                <HomeMap
                    onZoneClick={x => console.log(x)}
                />
                <DistrictEnergyBalance/>
            </main>
        </div>
    );
}

export default Home;
