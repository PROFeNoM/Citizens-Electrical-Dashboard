import './HamburgerButton.css';

import React from 'react';

interface Props {
	isOpen: boolean; // Boolean to determine if the menu is currently open or not
	onClick: () => void; // Callback to toggle the menu
}

/**
 * Hamburger button that opens or closes the menu when clicked.
 * 
 * @see Hamburger
 * @see HamburgerMenu
 */
export default class HamburgerButton extends React.Component<Props, {}> {
	render() {
		return (
			<button
				className={`hamburger-button ${this.props.isOpen ? 'active' : ''}`}
				onClick={this.props.onClick}
			>
				<div className="hamburger-button-line"></div>
				<div className="hamburger-button-line"></div>
				<div className="hamburger-button-line"></div>
			</button>
		);
	}
}
