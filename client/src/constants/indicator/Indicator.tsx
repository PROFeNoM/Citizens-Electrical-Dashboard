export enum IndicatorType {
	ConsumptionDonut,
	EnergyBalance,
	LocalProductionInfo,
	SolarDonut,
	TotalConsumption,
	TypicalConsumptionDay,
	TypicalProductionDay,
	WeeklyProduction,
	ChargingStations
};

export enum IndicatorClass {
	General = 'Informations globales',
	Consumption = 'Consommation',
	Production = 'Production',
	Station = 'Stations de recharges'
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
registerIndicator(IndicatorClass.Consumption, IndicatorType.TotalConsumption, 'Consommation totale');
registerIndicator(IndicatorClass.Consumption, IndicatorType.TypicalConsumptionDay, 'Journée type de consommation');
registerIndicator(IndicatorClass.Consumption, IndicatorType.ConsumptionDonut, 'Consommation par type de batiment');

// Indicateurs de production
registerIndicator(IndicatorClass.Production, IndicatorType.LocalProductionInfo, 'Production locale');
registerIndicator(IndicatorClass.Production, IndicatorType.SolarDonut, 'Production solaire');
registerIndicator(IndicatorClass.Production, IndicatorType.TypicalProductionDay, 'Journée type de production');
registerIndicator(IndicatorClass.Production, IndicatorType.WeeklyProduction, 'Production hebdomadaire');

// Indicateurs de stations
registerIndicator(IndicatorClass.Station, IndicatorType.ChargingStations, 'Stations de recharge');
