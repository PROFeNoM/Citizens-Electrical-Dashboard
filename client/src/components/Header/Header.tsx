import './Header.css';

import logoEnedis from 'images/logoEnedis.png';
import logoEnedisSmall from 'images/logoEnedisSmall.png';
import Hamburger from '../Hamburger/Hamburger';

interface HeaderProps {
	title: string;
}

function Header({ title }: HeaderProps) {
	return (
		<div id="header-container">
			<div id="hamburger-menu-wrapper">
				<Hamburger />
			</div>
			<div id="title-wrapper">
				<p id="title">{title}</p>
			</div>
			<div id="logo-wrapper">
				<img src={logoEnedis} id="enedis-logo" alt="Logo Enedis" color="#fff" />
				<img src={logoEnedisSmall} id="enedis-logo-small" alt="Logo Enedis petit" color="#fff" />
			</div>
		</div>
	);
}

export default Header;
