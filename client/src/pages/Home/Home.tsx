import './Home.css';

import React from 'react';

import { Header, DataContainer } from 'containers';

/**
 * Page that contains the map and the indicators.
 * 
 * @see About
 * @see Error
 * @see Legal
 */
export default class Home extends React.Component<{}, {}> {
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
