export const enum IndicatorType {
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

export const enum IndicatorClass {
	Global,
	Consumption,
	Production,
	Station
};

export interface Indicator {
	type: IndicatorType;
	class: IndicatorClass;
	name: string;
}


const indicatorRegistry: { [key: string]: Indicator } = {};

export function registerIndicator(indicatorType: IndicatorType, indicatorClass: IndicatorClass, name: string): void {
	indicatorRegistry[indicatorType] = {
		type: indicatorType,
		class: indicatorClass,
		name: name
	};
}

export function getIndicator(indicatorType: IndicatorType): Indicator {
	return indicatorRegistry[indicatorType];
}

// Indicateurs globaux
registerIndicator(IndicatorType.EnergyBalance, IndicatorClass.Global, 'Bilan général');

// Indicateurs de consommation
registerIndicator(IndicatorType.TotalConsumption, IndicatorClass.Consumption, 'Consommation totale');
registerIndicator(IndicatorType.TypicalConsumptionDay, IndicatorClass.Consumption, 'Journée type de consommation');
registerIndicator(IndicatorType.ConsumptionDonut, IndicatorClass.Consumption, 'Consommation par type de batiment');

// Indicateurs de production
registerIndicator(IndicatorType.LocalProductionInfo, IndicatorClass.Production, 'Production locale');
registerIndicator(IndicatorType.SolarDonut, IndicatorClass.Production, 'Production solaire');
registerIndicator(IndicatorType.TypicalProductionDay, IndicatorClass.Production, 'Journée type de production');
registerIndicator(IndicatorType.WeeklyProduction, IndicatorClass.Production, 'Production hebdomadaire');

// Indicateurs de stations
registerIndicator(IndicatorType.ChargingStations, IndicatorClass.Station, 'Stations de recharge');
