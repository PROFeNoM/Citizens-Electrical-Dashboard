const {Pool, Client} = require("pg");

interface Credentials {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

export enum Building {
    Residential,
    Profesionnal,
    Tertiary,
    Lighting,
    All
}

const credentials: Credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

export function getUrbanZoneNumberOfBuildings(urbanZone: string): number {
    return 0;
}

export function getUrbanZoneArea(urbanZone: string): number {
    return 0;
}

export function getDistrictNumberOfBuildings(): number {
    return 0;
}

export function getDistrictArea(): number {
    return 0;
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
