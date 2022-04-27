import './Home.css';
import { zones } from 'geodata';
import { ConsumerProfile } from 'scripts/api';

export enum Indicator {
	ConsumptionDonut,
	DistrictEnergyBalance,
	LocalProductionInfo,
	SolarDonut,
	TotalConsumption,
	TypicalConsumptionDay,
	TypicalProductionDay,
	WeeklyProduction
};

export enum IndicatorClass {
	Global,
	Consumption,
	Production,
	Station
};

interface tree { label: string, value?: Indicator, children?: tree[] }

export const indicatorTree: tree[] = [
	{
		label: 'Informations globales',
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
				label: 'Répartion selon le type de bâtiment',
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
		]
	}
]

export enum Information {
	VueGlobale = 'Vue Globale',
	JourneeType = 'Journée type'
}

export const selectOptionsBuildings: { value: ConsumerProfile, label: string }[] = [
	{ value: ConsumerProfile.ALL, label: "Tous les bâtiments" },
	{ value: ConsumerProfile.RESIDENTIAL, label: "Résidentiels" },
	{ value: ConsumerProfile.TERTIARY, label: "Tertiaires" },
	{ value: ConsumerProfile.PROFESSIONAL, label: "Professionnels" },
	{ value: ConsumerProfile.PUBLIC_LIGHTING, label: "Eclairage publique" },
];

export const selectOptionsZoneNames = zones.features.map((item) => { return ({ value: item.properties.libelle, label: item.properties.libelle }) });

selectOptionsZoneNames.push({ value: "Quartier de la Bastide", label: "Quartier de la Bastide" });

export const selectOptionsInformations: { value: Information, label: string }[] = [
	{ value: Information.VueGlobale, label: "Vue globale" },
	{ value: Information.JourneeType, label: "Journée type" },
];
