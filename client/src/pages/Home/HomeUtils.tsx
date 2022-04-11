import { zones } from '../../geodata';

import { ConsumerProfile } from '../../scripts/api';




export enum Indicator {
    Production = "Production",
    Consommation = "Consommation", 
    BornesDeRecharge = "Bornes de rechage", 
    InformationsGlobales = "Informations globales"
};

export enum Information {
    VueGlobale = "Vue Globale",
    JourneeType = "Journée type"
}


export const dropdownStyle = {
    'width': '95%',
    'height': '80%',
};

export const selectOptionsBuild:{value: ConsumerProfile, label: string}[] = [
    { value: ConsumerProfile.ALL, label: "Tous les bâtiments"},
    { value: ConsumerProfile.RESIDENTIAL, label: "Résidentiels"},
    { value: ConsumerProfile.TERTIARY, label: "Tertiaires"},
    { value: ConsumerProfile.PROFESSIONAL, label: "Professionnels"},
    { value: ConsumerProfile.PUBLIC_LIGHTING, label: "Eclairage publique"},
];


export const selectOptionsDist = zones.features.map((item) => {return ({value: item.properties.libelle, label: item.properties.libelle})});

selectOptionsDist.push({value: "Quartier de la Bastide", label: "Quartier de la Bastide"});


export const selectOptionsInd:{value: Indicator, label: string}[] = [
    { value: Indicator.Production, label: "Production"},
    { value: Indicator.Consommation, label: "Consommation"},
    { value: Indicator.BornesDeRecharge, label: "Bornes de rechage"},
    { value: Indicator.InformationsGlobales, label: "Informations globales"},
];

export const selectOptionsInf:{value: Information, label: string}[] = [
    { value: Information.VueGlobale, label: "Vue globale"},
    { value: Information.JourneeType, label: "Journée type"},
];