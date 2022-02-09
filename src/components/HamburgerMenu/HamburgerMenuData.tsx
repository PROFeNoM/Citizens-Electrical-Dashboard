import React from "react";

// TODO: Use ENEDIS's visual identity, this is just for test purpose atm
import * as AiIcons from "react-icons/ai";

export const HamburgerMenuData = [
    {
        title: 'Home',
        path: '/',
        icon: <AiIcons.AiOutlineHome />,
        cName: 'nav-text'
    },
    {
        title: 'Connection',
        path: '/connection',
        icon: <AiIcons.AiOutlineDisconnect />,
        cName: 'nav-text'
    },
    {
        title: 'About',
        path: '/about',
        icon: <AiIcons.AiOutlineInfoCircle />,
        cName: 'nav-text'
    },
    {
        title: 'Legal',
        path: '/legal',
        icon: <AiIcons.AiOutlineBook />,
        cName: 'nav-text'
    },
]