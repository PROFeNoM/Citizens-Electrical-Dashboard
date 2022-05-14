import './Error.css';

import React from 'react';

import { Header } from 'containers';

/**
 * Default page to display when page is not found. 
 * 
 * @see About
 * @see Legal
 * @see Home
 */
export default class Error extends React.Component<{}, {}> {
	render() {
		return (
			<>
				<Header title={'Erreur'} />
				<main>
					<div id="error-text-wrapper">
						<p>
							La page que vous recherchez n'existe pas.
						</p>
					</div>
				</main>
			</>
		);
	}
}
