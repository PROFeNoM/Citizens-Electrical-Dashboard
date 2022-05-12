export enum IndicatorType {
	EnergyBalance,
	ConsumptionInfo,
	ConsumptionDonut,
	LocalProductionInfo,
	SolarDonut,
	TotalConsumption,
	TypicalConsumptionDay,
	TypicalProductionDay,
	WeeklyConsumption,
	WeeklyProduction,
	ChargingStations
};

export enum IndicatorClass {
	General = 'Informations globales',
	Consumption = 'Consommation',
	Production = 'Production',
	Station = 'Stations de recharge'
};

export interface Indicator {
	class: IndicatorClass;
	type: IndicatorType;
	name: string;
}

interface Registry {
	[key: number]: Indicator;
};

export const indicatorRegistry: Registry = {};

export function registerIndicator(indicatorClass: IndicatorClass, indicatorType: IndicatorType, name: string): void {
	indicatorRegistry[indicatorType] = {
		class: indicatorClass,
		type: indicatorType,
		name: name
	};
}

export function getIndicatorFromType(indicatorType: IndicatorType): Indicator {
	return indicatorRegistry[indicatorType];
}

export function getAllIndicators(): Indicator[] {
	return Object.values(indicatorRegistry);
}

// Indicateurs globaux
registerIndicator(IndicatorClass.General, IndicatorType.EnergyBalance, 'Bilan général');

// Indicateurs de consommation
registerIndicator(IndicatorClass.Consumption, IndicatorType.ConsumptionInfo, 'Bilan de consommation');
registerIndicator(IndicatorClass.Consumption, IndicatorType.ConsumptionDonut, 'Répartition de la consommation');
registerIndicator(IndicatorClass.Consumption, IndicatorType.WeeklyConsumption, 'Consommation hebdomadaire');
registerIndicator(IndicatorClass.Consumption, IndicatorType.TotalConsumption, 'Consommation par filière');
registerIndicator(IndicatorClass.Consumption, IndicatorType.TypicalConsumptionDay, 'Journée type de consommation');

// Indicateurs de production
registerIndicator(IndicatorClass.Production, IndicatorType.LocalProductionInfo, 'Bilan de production');
registerIndicator(IndicatorClass.Production, IndicatorType.SolarDonut, 'Répartition de la production solaire');
registerIndicator(IndicatorClass.Production, IndicatorType.WeeklyProduction, 'Production hebdomadaire');
registerIndicator(IndicatorClass.Production, IndicatorType.TypicalProductionDay, 'Journée type de production');

// Indicateurs de stations
registerIndicator(IndicatorClass.Station, IndicatorType.ChargingStations, 'Répartition des stations');
