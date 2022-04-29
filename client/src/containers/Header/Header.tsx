import './Header.css';

import React from 'react';

import logoEnedis from 'images/logoEnedis.png';
import logoEnedisSmall from 'images/logoEnedisSmall.png';
import { Hamburger } from 'components/Header';

interface Props {
	title: string;
}

export default class Header extends React.Component<Props, {}> {
	render() {
		return (
			<div id="header-container">
				<div id="hamburger-menu-wrapper">
					<Hamburger />
				</div>
				<div id="title-wrapper">
					<p id="title">{this.props.title}</p>
				</div>
				<div id="logo-wrapper">
					<img src={logoEnedis} id="enedis-logo" alt="Logo Enedis" color="#fff" />
					<img src={logoEnedisSmall} id="enedis-logo-small" alt="Logo Enedis petit" color="#fff" />
				</div>
			</div>
		);
	}
}
