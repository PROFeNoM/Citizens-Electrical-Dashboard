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
    All,
    Residential1,
    Residential2,
    Professional1,
    Professional2
}

const credentials: Credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

const pool = new Pool(credentials);

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
            case Building.Residential1:
                return dataProperties.RES1;
            case Building.Residential2:
                return dataProperties.RES2;
            case Building.Professional:
                return dataProperties.PRO1 + dataProperties.PRO2;
            case Building.Professional1:
                return dataProperties.PRO1;
            case Building.Professional2:
                return dataProperties.PRO2;
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

async function runQuery(query: string) {
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err: any) {
        return err.stack;
    }
}

export async function getUrbanZoneElectricityConsumption(t1: string, buildingType: Building, urbanZone: string, t2?: string): Promise<number> {
    let queries: string[] = [];
    let weights: any[] = [];

    if (!t2) {
        switch (buildingType) {
            case Building.Residential:
                queries.push(`select avg(COURBE_MOYENNE) as COURBE_MOYENNE
                              from CONSO_INF36_REGION
                              where PROFIL like \'RES1\%\'
                                and HORODATAGE = \'${t1}\'
                              group by HORODATAGE`);

                queries.push(`
                    select avg(COURBE_MOYENNE) as COURBE_MOYENNE
                    from CONSO_INF36_REGION
                    where PROFIL like \'RES2\%\'
                      and HORODATAGE = \'${t1}\'
                    group by HORODATAGE`);

                weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential1));
                weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential2));

                break;
            case Building.Professional:
                queries.push(`select avg(COURBE_MOYENNE) as COURBE_MOYENNE
                              from CONSO_INF36_REGION
                              where PROFIL like \'PRO1\%\'
                                and HORODATAGE = \'${t1}\'
                              group by HORODATAGE`);

                queries.push(`
                    select avg(COURBE_MOYENNE) as COURBE_MOYENNE
                    from CONSO_INF36_REGION
                    where PROFIL like \'PRO2\%\'
                      and HORODATAGE = \'${t1}\'
                    group by HORODATAGE`);

                weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional1));
                weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional2));
                break;
            case Building.Tertiary:
                // TODO
                break;
            case Building.Lighting:
                // TODO
                break;
            case Building.All:
                // TODO
                break;
        }
    } else {
        // TODO
    }

    let resultWh: number = 0;

    for (let i: number = 0; i < queries.length; i++) {
        let res = await runQuery(queries[i]);
        resultWh += res[0].courbe_moyenne * weights[i]();
    }

    return resultWh;
}

export async function getDistrictElectricityConsumption(t1: string, buildingType: Building, t2?: string): Promise<number> {
    return 0;
}

export async function getUrbanZoneElectricityProduction(t1: string, urbanZone: string, t2?: string): Promise<number> {
    return 0;
}

export async function getDistrictElectricityProduction(t1: string, t2?: string): Promise<number> {
    return 0;
}

export async function getUrbanZoneSelfConsumptionRatio(t1: string, urbanZone: string, t2?: string): Promise<number> {
    return 0;
}

export async function getDistrictSelfConsumption(t1: string, t2?: string): Promise<number> {
    return 0;
}