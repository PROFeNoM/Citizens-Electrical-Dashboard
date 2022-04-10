import { zones } from '../../geodata';



export const dropdownStyleBuild = {
    width: 150,
    'display': 'flex',
    'text-transform': 'uppercase'
};


export const selectOptionsBuild = [
    { value: 1, label: "Tous les bâtiments"},
    { value: 2, label: "Résidentiels"},
    { value: 3, label: "Tertiaires"},
    { value: 4, label: "Professionnels"},
    { value: 5, label: "Eclairage publique"},
];



export const dropdownStyleDist = {
    width: 150,
    'display': 'flex',
    'text-transform': 'uppercase'
};


export const selectOptionsDist = zones.features.map((item, index) => {return ({value: index+1, label: item.properties.libelle})});

selectOptionsDist.push({value: 0, label: "Tous le quartier"});


export const dropdownStyleInd = {
    width: 150,
    'display': 'flex',
    'text-transform': 'uppercase'
};


export const selectOptionsInd = [
    { value: 1, label: "Production"},
    { value: 2, label: "Consommation"},
    { value: 3, label: "Bornes de rechage"},
    { value: 3, label: "Informations globales"},
];

export const dropdownStyleInf = {
    width: 150,
    'display': 'flex',
    'text-transform': 'uppercase'
};


export const selectOptionsInf = [
    { value: 1, label: "Vue globale"},
    { value: 2, label: "Journée type"},
];