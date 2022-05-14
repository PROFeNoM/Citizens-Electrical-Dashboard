export enum IndicatorType {
	GlobalInfo,
	ConsumptionInfo,
	ConsumptionDonut,
	ProfileConsumption,
	TypicalConsumptionDay,
	WeeklyConsumption,
	ProductionInfo,
	ProductionDonut,
	TypicalProductionDay,
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

// Global indicators
registerIndicator(IndicatorClass.General, IndicatorType.GlobalInfo, 'Bilan général');

// Consumption indicators
registerIndicator(IndicatorClass.Consumption, IndicatorType.ConsumptionInfo, 'Bilan de consommation');
registerIndicator(IndicatorClass.Consumption, IndicatorType.ConsumptionDonut, 'Répartition de la consommation');
registerIndicator(IndicatorClass.Consumption, IndicatorType.WeeklyConsumption, 'Consommation hebdomadaire');
registerIndicator(IndicatorClass.Consumption, IndicatorType.ProfileConsumption, 'Consommation par filière');
registerIndicator(IndicatorClass.Consumption, IndicatorType.TypicalConsumptionDay, 'Journée type de consommation');

// Production indicators
registerIndicator(IndicatorClass.Production, IndicatorType.ProductionInfo, 'Bilan de production');
registerIndicator(IndicatorClass.Production, IndicatorType.ProductionDonut, 'Répartition de la production solaire');
registerIndicator(IndicatorClass.Production, IndicatorType.WeeklyProduction, 'Production hebdomadaire');
registerIndicator(IndicatorClass.Production, IndicatorType.TypicalProductionDay, 'Journée type de production');

// Charging station indicators
registerIndicator(IndicatorClass.Station, IndicatorType.ChargingStations, 'Répartition des stations');
