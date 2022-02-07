import * as turf from '@turf/turf'

const {Pool, Client} = require("pg");
const {json_Decoupage_urbain} = require("../map/layers/Decoupage_urbain");
const {json_eclairage_public_features} = require("../map/bor_ptlum");

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

interface LightingFeature {
    dataset: string;
    recordid: string;
    fields: {
        x_long: string;
        rowkey: string;
        geometrie: [number, number];
        partitionKey: string;
        timestamp: string;
        y_lat: string;
        code_pl: string;
        entityid: string;
        categorie: string;
        domaine: string;
    };
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    record_timestamp: string;
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
                const searchWithin = turf.polygon(data.geometry.coordinates[0]);
                const ptsWithin: LightingFeature[] = json_eclairage_public_features.filter((feature: LightingFeature) => turf.booleanWithin(turf.point(feature.geometry.coordinates), searchWithin));
                return ptsWithin.length;
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

/**
 * Return the consumption of electricity for a given urban zone in Wh
 * @param t1 Timestamp of the beginning of the time period
 * @param buildingType Building type to get the consumption from
 * @param urbanZone Urban zone of the buildings
 * @param t2 Timestamp of the end of the time period
 */
export async function getUrbanZoneElectricityConsumption(t1: string, buildingType: Building, urbanZone: string, t2?: string): Promise<number> {
    let queries: string[] = [];
    let weights: any[] = [];

    const horodatageCond: string = !t2 ? `= \'${t1}\'` : `between \'${t1}\' and \'${t2}\'`;

    function _addQuery(profile: string, t1: string, t2?: string) {
        queries.push(`
            select avg(COURBE_MOYENNE) as COURBE_MOYENNE
            from CONSO_INF36_REGION
            where PROFIL like \'${profile}\%\'
              and HORODATAGE ${horodatageCond}
            group by HORODATAGE`);
    };

    switch (buildingType) {
        case Building.Residential:
            _addQuery("RES1", t1, t2);
            _addQuery("RES2", t1, t2);

            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential1));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential2));
            break;
        case Building.Professional:
            _addQuery("PRO1", t1, t2);
            _addQuery("PRO2", t1, t2);

            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional1));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional2));
            break;
        case Building.Tertiary:
            queries.push(`
                select sum(NB_POINT_SOUTIRAGE * COURBE_MOYENNE) / sum(NB_POINT_SOUTIRAGE) as COURBE_MOYENNE
                from CONSO_SUP36_REGION
                where HORODATAGE ${horodatageCond}
                group by HORODATAGE;`);

            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary));
            break;
        case Building.Lighting:
            _addQuery("PRO5", t1, t2);

            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting));
            break;
        case Building.All:
            _addQuery("RES1", t1, t2);
            _addQuery("RES2", t1, t2);
            _addQuery("PRO1", t1, t2);
            _addQuery("PRO2", t1, t2);
            queries.push(`
                select sum(NB_POINT_SOUTIRAGE * COURBE_MOYENNE) / sum(NB_POINT_SOUTIRAGE) as COURBE_MOYENNE
                from CONSO_SUP36_REGION
                where HORODATAGE ${horodatageCond}
                group by HORODATAGE;`);
            _addQuery("PRO5", t1, t2);

            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential1));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential2));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional1));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional2));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary));
            weights.push(() => getUrbanZoneNumberOfBuildings(urbanZone, Building.Lighting));
            break;
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