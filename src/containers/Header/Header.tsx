import React from 'react';
import './Header.css';
import logo from '../../images/logo.png';

interface HeaderProps {
    title: string;
}

function Header({title}: HeaderProps) {
    return (
        <>
            <header className="HeaderImg">
                <img src={logo} className="Logo" alt="logo" color="#fff"/>
            </header>
            <div>
                <h1 className='header-title'>{title}</h1>
            </div>
        </>
    );
}

export default Header;