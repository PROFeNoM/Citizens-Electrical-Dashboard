import './HamburgerMenu.css';

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

export function HamburgerMenu({ open }) {
    return (
        <div className={open ? "hamburger-menu active" : "hamburger-menu"}>
            {hamburgerMenuData.map((item, index) => {
                return (
                    <li key={index} className="hamburger-menu-item">
                        <Link to={item.path}>
                            {item.icon}
                            <span className="hamburger-menu-item-title">{item.title}</span>
                        </Link>
                    </li>
                )
            })}
        </div>
    )
}