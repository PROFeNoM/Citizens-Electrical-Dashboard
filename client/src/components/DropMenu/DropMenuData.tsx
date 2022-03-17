import React from "react"
import {getAllUrbanZonesName} from "../../scripts/dbUtils";

export const DropMenuData = [
    {
        title: 'Production',
        path: '/production',
        cName: 'nav-text'
    },
    {
        title: 'Consommation',
        path: '/consommation',
        cName: 'nav-text'
    },
    {
        title: 'Bornes de recharges',
        path: '/bornes',
        cName: 'nav-text'
    },
];

export const DropMenuData2 = getAllUrbanZonesName()
        .map(name => {
           return {
               title: name,
               path: name,
               cName: 'nav-text'
           }
        });