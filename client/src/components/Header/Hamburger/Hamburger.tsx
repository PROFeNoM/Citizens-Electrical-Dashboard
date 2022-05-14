import './HamburgerMenu.css';

import React from 'react';

import HamburgerButton from './HamburgerButton';
import HamburgerMenu from './HamburgerMenu';

interface State {
	isOpen: boolean; // Boolean to determine if the menu is currently open or not
}

/**
 * Hamburger component that toggles the menu to navigate between pages.
 * @see HamburgerButton
 * @see HamburgerMenu
 */
export default class Hamburger extends React.Component<{}, State> {
	constructor(props: {}) {
		super(props);

		this.state = {
			isOpen: false
		};
	}

	render() {
		return (
			<div id="hamburger-wrapper">
				<HamburgerButton
					isOpen={this.state.isOpen}
					onClick={() => this.setState({ isOpen: !this.state.isOpen })}
				/>
				<HamburgerMenu isOpen={this.state.isOpen} />
			</div>
		);
	}
}
