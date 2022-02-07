import {
    Building,
    getDistrictArea,
    getUrbanZoneElectricityConsumption,
    getUrbanZoneNumberOfBuildings,
    getDistrictElectricityConsumption
} from "../scripts/dbUtils"

describe('getUrbanZoneNumberOfBuildings test suite', () => {
   test('Test with lighting', () => {
       expect(getUrbanZoneNumberOfBuildings("sieges sociaux", Building.Lighting)).toStrictEqual(26);
   })
});

describe('getDistrictArea test suite', () => {
    test('Area of La Bastide', () => {
        expect(getDistrictArea()).toBeCloseTo(1027673.9721528001);
    })
});

describe('getUrbanZoneElectricityConsumption test suite', () => {
    test('Test with residential buildings at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Residential, "quartier historique sud avenue thiers");
        expect(r).toStrictEqual(463600);
    });

    test('Test with residential buildings in an urban zone without those at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Residential, "sieges sociaux");
        expect(r).toStrictEqual(0);
    });

    test('Test with professional buildings at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Professional, "quartier historique sud avenue thiers");
        expect(r).toStrictEqual(42800);
    });

    test('Test with professional buildings in an urban zone without those at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Professional, "sieges sociaux");
        expect(r).toStrictEqual(0);
    });

    test('Test with public lighting buildings during the night at a single timestamp', async () => {
       const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Lighting, "sieges sociaux");
       expect(r).toStrictEqual(22464);
    });

    test('Test with public lighting buildings during the day at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 12:30:00+02:00', Building.Lighting, "sieges sociaux");
        expect(r).toStrictEqual(286);
    });

    test('Test with professional buildings in an urban zone without those at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Tertiary, "Bastide Niel");
        expect(r).toStrictEqual(0);
    });

    test('Test with professional buildings in an urban zone with those at a single timestamp', async () => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Tertiary, "sieges sociaux");
        expect(r).toBeCloseTo(856283.5029469548);
    });

    test('Test with all buildings at a single timestamp', async() => {
       const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:30:00+02:00', Building.All, "quartier historique sud avenue thiers");
       expect(r).toBeCloseTo(789792);
    });

    test('Test with residential buildings between two timestamps', async() => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:00:00+02:00', Building.Residential, "quartier historique sud avenue thiers", '2021-09-30 23:30:00+02:00');
        expect(r).toBeCloseTo(483200);
    });

    test('Test with all buildings between two timestamps', async() => {
        const r = await getUrbanZoneElectricityConsumption('2021-09-30 23:00:00+02:00', Building.All, "quartier historique sud avenue thiers", '2021-09-30 23:30:00+02:00');
        expect(r).toBeCloseTo(829366);
    })
});

describe('getDistrictElectricityConsumption test suite',() => {
    test('Test with Residential buildings at a single timestamp', async ()  => {
        const r = await getDistrictElectricityConsumption('2021-09-30 23:30:00+02:00', Building.Residential);
        expect(r).toBeCloseTo(1020600);
    });

    test('Test with All buildings between two timestamps', async ()  => {
        const r = await getDistrictElectricityConsumption('2021-09-30 23:00:00+02:00', Building.All, '2021-09-30 23:30:00+02:00');
        expect(r).toBeCloseTo(2663956.7072691554);
    });

});