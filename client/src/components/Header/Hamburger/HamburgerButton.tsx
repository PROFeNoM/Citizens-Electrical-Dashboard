import './HamburgerButton.css';

import React from 'react';

interface Props {
    isOpen: boolean,
    onClick: () => void
}

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
