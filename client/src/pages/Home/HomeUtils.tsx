import { zones } from '../../geodata';



export const dropdownStyleBuild = {
    'width': '95%',
    'height': '80%',  
};


export const selectOptionsBuild = [
    { value: 1, label: "Tous les bâtiments"},
    { value: 2, label: "Résidentiels"},
    { value: 3, label: "Tertiaires"},
    { value: 4, label: "Professionnels"},
    { value: 5, label: "Eclairage publique"},
];



export const dropdownStyleDist = {  
    'width': '95%',
    'height': '80%',  
};


export const selectOptionsDist = zones.features.map((item) => {return ({value: item.properties.libelle, label: item.properties.libelle})});

selectOptionsDist.push({value: "Quartier de la Bastide", label: "Quartier de la Bastide"});


export const dropdownStyleInd = {
    'width': '95%',
    'height': '80%',  
};


export const selectOptionsInd = [
    { value: "Production", label: "Production"},
    { value: "Consommation", label: "Consommation"},
    { value: "Bornes de rechage", label: "Bornes de rechage"},
    { value: "Informations globales", label: "Informations globales"},
];

export const dropdownStyleInf = {
    'width': '95%',
    'height': '80%',  
};


export const selectOptionsInf = [
    { value: "Vue globale", label: "Vue globale"},
    { value: "Journée type", label: "Journée type"},
];