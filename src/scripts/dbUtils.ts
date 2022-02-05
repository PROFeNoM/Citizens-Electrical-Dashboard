import * as turf from '@turf/turf'

const {Pool, Client} = require("pg");
const {json_Decoupage_urbain} = require("../map/layers/Decoupage_urbain");

interface Credentials {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export enum Building {
    Residential,
    Professional,
    Tertiary,
    Lighting,
    Producer,
    All
}

const credentials: Credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

interface UrbanZoneFeature {
    type: string;
    properties: {
        gid: number;
        libelle: string;
        RES1: number;
        RES2: number;
        PRO1: number;
        PRO2: number;
        ENT: number;
        PROD_F5: number;
    };
    geometry: {
        type: string;
        coordinates: [number, number][][][];
    }
}

/**
 * Return the features section of an urban zone
 * @param urbanZone Urban Zone for which the feature section shall be returned
 * @param json JSON to search from
 */
function getUrbanZoneFeatures(urbanZone: string, json: { features: [] }): UrbanZoneFeature {
    return json.features.filter((data: UrbanZoneFeature) => data.properties.libelle == urbanZone)[0];
}

/**
 * Return the number of buildings in an urban zone
 * @param urbanZone Urban zone to search into
 * @param buildingType Building type searched
 */
export function getUrbanZoneNumberOfBuildings(urbanZone: string, buildingType: Building): number {
    const data: UrbanZoneFeature = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);

    if (data) {
        const dataProperties: UrbanZoneFeature["properties"] = data.properties;
        switch (buildingType) {
            case Building.Residential:
                return dataProperties.RES1 + dataProperties.RES2;
            case Building.Professional:
                return dataProperties.PRO1 + dataProperties.PRO2;
            case Building.Tertiary:
                return dataProperties.ENT;
            case Building.Lighting:
                return 0; // TODO: find out where the value is
            case Building.Producer:
                return dataProperties.PROD_F5;
        }
    }

    return 0;
}

/**
 * Return the area in square meters of the urban zone
 * @param urbanZone Urban zone for which the area should be computed
 */
export function getUrbanZoneArea(urbanZone: string): number {
    const data: UrbanZoneFeature = getUrbanZoneFeatures(urbanZone, json_Decoupage_urbain);

    if (data)
        return turf.area(turf.polygon(data.geometry.coordinates[0]));
    else
        return 0;
}

/**
 * Return the number of buildings in La Bastide
 * @param buildingType
 */
export function getDistrictNumberOfBuildings(buildingType: Building): number {
    return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneNumberOfBuildings(curr.properties.libelle, buildingType), 0);
}

/**
 * Return the area of La Bastide
 */
export function getDistrictArea(): number {
    return json_Decoupage_urbain.features.reduce((prev: number, curr: UrbanZoneFeature) => prev + getUrbanZoneArea(curr.properties.libelle), 0);
}

export function getUrbanZoneElectricityConsumption(t1: string, buildingType: Building, urbanZone: string, t2?: number): number {
    return 0;
}

export function getDistrictElectricityConsumption(t1: string, buildingType: Building, t2?: number): number {
    return 0;
}

export function getUrbanZoneElectricityProduction(t1: string, urbanZone: string, t2?: number): number {
    return 0;
}

export function getDistrictElectricityProduction(t1: string, t2?: number): number {
    return 0;
}

export function getUrbanZoneSelfConsumptionRatio(t1: string, urbanZone: string, t2?: number): number {
    return 0;
}

export function getDistrictSelfConsumption(t1: string, t2?: number): number {
    return 0;
}

/*
console.log(getUrbanZoneNumberOfBuildings("quartier historique sud avenue thiers", Building.Producer));
console.log(getUrbanZoneArea("quartier historique sud avenue thiers"));
console.log(getDistrictNumberOfBuildings(Building.Residential));
console.log(getDistrictArea());
*/