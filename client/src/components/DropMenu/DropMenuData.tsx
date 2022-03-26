import React from "react"
import {getAllUrbanZonesName} from "../../scripts/dbUtils";
import chart_ic from '../../images/chart_icon.png'
import i_ic from '../../images/i_icon.png'

export const DropMenuData1 = [
    {
        title: 'Production',
        path: '/production',
        icon: chart_ic,
        cName: 'nav-text'
    },
    {
        title: 'Consommation',
        path: '/consommation',
        icon: chart_ic,
        cName: 'nav-text'
    },
    {
        title: 'Bornes de recharges',
        path: '/bornes',
        icon: i_ic,
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

export const DropMenuData3 = [
           "Residentiel",
           "Professionnel",
           "Tertiaire",
           "Eclairage",
           "Producteur",
           "Total"]
        .map(name => {
           return {
               title: name,
               path: name,
               cName: 'nav-text'
           }
        });