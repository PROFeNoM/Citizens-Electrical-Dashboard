import React from "react";

// TODO: Use ENEDIS's visual identity, this is just for test purpose atm
import * as AiIcons from "react-icons/ai";

export const HamburgerMenuData = [
    {
        title: 'Accueil',
        path: '/',
        icon: <AiIcons.AiOutlineHome />,
        cName: 'nav-text'
    },
    {
        title: 'Connexion',
        path: '/connection',
        icon: <AiIcons.AiOutlineDisconnect />,
        cName: 'nav-text'
    },
    {
        title: 'à propos',
        path: '/about',
        icon: <AiIcons.AiOutlineInfoCircle />,
        cName: 'nav-text'
    },
    {
        title: 'Mentions légales',
        path: '/legal',
        icon: <AiIcons.AiOutlineBook />,
        cName: 'nav-text'
    },
]