import React from 'react';
import './Header.css';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {HamburgerMenu} from "../../components";
import {About, Connection, Error, Home, Legal} from "../../pages";

interface HeaderProps {
    title: string;
}

function Header({title}: HeaderProps) {
    return (
        <>
            <header className="HeaderImg">
                <img src={require("../../images/logo.png")} className="Logo" alt="logo" color="#fff"/>
            </header>
            <div>
                <h1 className='header-title'>{title}</h1>
            </div>
        </>
    );
}

export default Header;