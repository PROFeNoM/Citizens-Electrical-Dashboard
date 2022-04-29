import './HamburgerMenu.css';

import React from 'react';
import { Link } from 'react-router-dom';
import * as AiIcons from 'react-icons/ai';

const hamburgerMenuData = [
    {
        title: 'Accueil',
        path: '/',
        icon: <AiIcons.AiOutlineHome />
    },
    {
        title: 'Connexion',
        path: '/connection',
        icon: <AiIcons.AiOutlineDisconnect />
    },
    {
        title: 'à propos',
        path: '/about',
        icon: <AiIcons.AiOutlineInfoCircle />
    },
    {
        title: 'Mentions légales',
        path: '/legal',
        icon: <AiIcons.AiOutlineBook />
    },
];

interface Props {
    isOpen: boolean
}

export default class HamburgerMenu extends React.Component<Props, {}> {
    render() {
        return (
            <div className={`hamburger-menu ${this.props.isOpen ? 'active' : ''}`}>
                {hamburgerMenuData.map((item, index) => {
                    return (
                        <li key={index} className="hamburger-menu-item">
                            <Link to={item.path}>
                                {item.icon}
                                <span className="hamburger-menu-item-title">{item.title}</span>
                            </Link>
                        </li>
                    );
                })}
            </div>
        );
    }
}
