import React from 'react';
import './Header.css';
import logo from '../../images/logo.png';

interface HeaderProps {
	title: string;
}

function Header({title}: HeaderProps) {
	return (
		<header>
			<div/>
			<h1 className='header-title'>{title}</h1>
			<img src={logo} className="logo" alt="Logo Enedis" color="#fff"/>
		</header>
	);
}

export default Header;