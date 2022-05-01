import './Home.css';

import React from 'react';

import { Header, DataContainer } from 'containers';

/**
 * Home page
 * 
 * Contains the header and the main data container.
 */
export default class Home extends React.Component<{}, {}>{
    render() {
        return (
            <div id="home-container">
                <header>
                    <Header title='Tableau électrique citoyen' />
                </header>
                <main>
                    <DataContainer />
                </main>
            </div>
        );
    }
}
