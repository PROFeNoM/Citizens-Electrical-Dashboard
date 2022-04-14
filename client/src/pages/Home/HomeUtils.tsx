import './Home.css';
import { zones } from '../../geodata';

import { ConsumerProfile } from '../../scripts/api';




export enum Indicator {
    ConsumptionDonut,
    DistrictEnergyBalance, 
    LocalProductionInfo, 
    SolarDonut,
    TotalConsumption,
    WeeklyProduction,
    TypicalConsumptionDay,
    TypicalProductionDay
};

interface tree {label: string, value?: Indicator, children?: tree[]}

export const indicatorTree: tree[] = [
    {
    label: 'Information Globale',
    value: Indicator.DistrictEnergyBalance,
},
  {
    label: 'Consommation',
    children: [
      {
        label: 'Répartition selon le type de bâtiment',
        value: Indicator.ConsumptionDonut,
      },
      {
        label: 'Totale',
        value: Indicator.TotalConsumption,
      },
      {
        label: 'Journée type',
        value: Indicator.TypicalConsumptionDay,
      },
    ],
  },
  {
    label: 'Production',
    children: [
      {
        label: 'Locale',
        value: Indicator.LocalProductionInfo,
      },
      {
        label: 'Repartion selon le type de bâtiment',
        value: Indicator.SolarDonut,
      },
      {
        label: 'Hebdomadaire',
        value: Indicator.WeeklyProduction,
      },
      {
        label: 'Journée type',
        value: Indicator.TypicalProductionDay,
      }
    ],
  }
]



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


// export const selectOptionsInd:{value: Indicator, label: string}[] = [
//     { value: Indicator.Production, label: "Production"},
//     { value: Indicator.Consommation, label: "Consommation"},
//     { value: Indicator.BornesDeRecharge, label: "Bornes de rechage"},
//     { value: Indicator.InformationsGlobales, label: "Informations globales"},
// ];

export const selectOptionsInf:{value: Information, label: string}[] = [
    { value: Information.VueGlobale, label: "Vue globale"},
    { value: Information.JourneeType, label: "Journée type"},
];