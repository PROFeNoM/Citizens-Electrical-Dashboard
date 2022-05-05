import * as turf from '@turf/turf';

import { ConsumerProfile, ProducerProfile } from 'constants/profiles';
import { getBuildingsGeoJSON, getZonesGeoJSON, getPublicLightingGeoJSON, getChargingStationsGeoJSON, ZoneFeatureProperties } from 'geodata';
import { Feature, MultiPolygon } from 'geojson';

// FIXME client shouldn't have to compute that, client shouldn't have to compute anything
/** Exactly like booleanContains of @turf/turf, but it works with MultiPolygon. */
function polygonIsContained(containedFeature: Feature<MultiPolygon, any>, containerFeature: Feature<MultiPolygon, any>) {
	// each "for" will loop only once if the given features are made of only one polygon each (which is most likely the case)
	for (const polygon1 of containerFeature.geometry.coordinates) {
		for (const polygon2 of containedFeature.geometry.coordinates) {
			if (turf.booleanContains(
				{ type: 'Polygon', coordinates: polygon1 },
				{ type: 'Polygon', coordinates: polygon2 },
			)) {
				return true;
			}
		}
	}
	return false;
}

let zonesNbOfBuildings: Record<string, number> | null = null;

/**
 * Return the number of buildings in an urban zone
 * 
 * @param zoneName Urban zone to search into
 */
export async function getZoneNbOfBuildings(zoneName: string): Promise<number> {
	if (zonesNbOfBuildings === null) {
		// Compute number of buildings in each zone
		const [zones, buildingsGeoJSON] = await Promise.all([
			getZonesGeoJSON(),
			getBuildingsGeoJSON(),
		]);
		zonesNbOfBuildings = {};
		for (const zone of zones.features) {
			zonesNbOfBuildings[zone.properties.libelle] = buildingsGeoJSON.features.filter(building => polygonIsContained(building, zone)).length;
		}
	}
	return zonesNbOfBuildings[zoneName];
}

let zonesArea: Record<string, number> | null = null;

/**
 * Return the area in square meters of the urban zone
 * 
 * @param zoneName Urban zone for which the area should be computed
 */
export async function getZoneArea(zoneName: string): Promise<number> {
	if (zonesArea == null) {
		// Compute zones area in square meters
		zonesArea = {};
		for (const zone of (await getZonesGeoJSON()).features) {
			zonesArea[zone.properties.libelle] = turf.area(zone);
		}
	}
	return zonesArea[zoneName];
}

// Compute number of stations and charging points in each zone
let zonesStations: Record<string, { nbOfStations: number, nbOfChargingPoints: number }> | null = null;

/**
 * Return the number of charging stations and charging points in an urban zone.
 * 
 * @param zoneName Urban zone to search into
 */
export async function getZoneChargingStationsData(zoneName: string) {
	if (zonesStations == null) {
		// Compute number of stations and charging points in each zone
		const [zonesGeoJSON, chargingStationsGeoJSON] = await Promise.all([
			getZonesGeoJSON(),
			getChargingStationsGeoJSON(),
		]);
		zonesStations = {};
		for (const zone of zonesGeoJSON.features) {
			const stations = chargingStationsGeoJSON.features.filter(station => turf.booleanWithin(station, zone));
			const nbOfStations = stations.length;
			const nbOfChargingPoints = stations.reduce((acc, station) => acc + station.properties['Nb. de bornes total'], 0);
			zonesStations[zone.properties.libelle] = {
				nbOfStations,
				nbOfChargingPoints
			};
		}
	}
	return zonesStations[zoneName];
}

/**
 * Return the features section of an urban zone
 * 
 * @param zoneName urban zone for which the feature section shall be returned
 */
async function getZone(zoneName: string): Promise<Feature<MultiPolygon, ZoneFeatureProperties>> {
	return (await getZonesGeoJSON()).features.find(data => data.properties.libelle === zoneName);
}

export async function getZonesNames(): Promise<string[]> {
	return (await getZonesGeoJSON()).features.map(zone => zone.properties.libelle);
}

/**
 * Return the number of sites in an urban zone
 * 
 * @param zoneName Urban zone to search into
 * @param profile Building type searched
 */
export async function getZoneNbOfCollectionSites(zoneName: string, profile: ConsumerProfile): Promise<number> {
	const zone = await getZone(zoneName);
	const zoneProperties = zone.properties;

	switch (profile) {
		case ConsumerProfile.RESIDENTIAL:
			return zoneProperties.RES1 + zoneProperties.RES2;
		case ConsumerProfile.PROFESSIONAL:
			return zoneProperties.PRO1 + zoneProperties.PRO2;
		case ConsumerProfile.TERTIARY:
			return zoneProperties.ENT;
		case ConsumerProfile.PUBLIC_LIGHTING:
			return (await getPublicLightingGeoJSON()).features.filter(publicLighting => turf.booleanWithin(turf.point(publicLighting.geometry.coordinates), zone)).length;
		case ConsumerProfile.ALL:
		default:
			return (
				await Promise.all([
					getZoneNbOfCollectionSites(zoneName, ConsumerProfile.RESIDENTIAL),
					getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PROFESSIONAL),
					getZoneNbOfCollectionSites(zoneName, ConsumerProfile.TERTIARY),
					getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PUBLIC_LIGHTING),
				])
			).reduce((a, b) => a + b);
	}
}

/**
 * Return the number of production sites in an urban zone
 * 
 * @param zoneName Urban zone to search into
 * @param profile Producing type searched
 */
export async function getZoneNbOfProductionSites(zoneName: string, profile: ProducerProfile): Promise<number> {
	const zone = await getZone(zoneName);

	switch (profile) {
		case ProducerProfile.SOLAR:
		case ProducerProfile.ALL:
			return zone.properties.PROD_F5;
		default:
			return 0;
	}
}
