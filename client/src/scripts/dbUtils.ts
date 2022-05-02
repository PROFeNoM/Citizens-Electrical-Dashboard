import * as turf from '@turf/turf';

import { buildingsGeoJSON, zonesGeoJSON, publicLightingGeoJSON, chargingStationsGeoJSON, ZoneFeatureProperties } from 'geodata';
import { Feature, MultiPolygon } from 'geojson';
import { ConsumerProfile } from './api';

// Compute zones area in square meters
const zonesArea: Record<string, number> = {};
for (const zone of zonesGeoJSON.features) {
	zonesArea[zone.properties.libelle] = turf.area(zone);
}

// Compute number of buildings in each zone
const zonesNbOfBuildings: Record<string, number> = {};
for (const zone of zonesGeoJSON.features) {
	zonesNbOfBuildings[zone.properties.libelle] = buildingsGeoJSON.features.filter(building => polygonIsContained(building, zone)).length;
}

// Compute number of stations and charging points in each zone
const zonesStations: Record<string, { nbOfStations: number, nbOfChargingPoints: number }> = {};
for (const zone of zonesGeoJSON.features) {
	const stations = chargingStationsGeoJSON.features.filter(station => turf.booleanWithin(station, zone));
	const nbOfStations = stations.length;
	const nbOfChargingPoints = stations.reduce((acc, station) => acc + station.properties['Nb. de bornes total'], 0);
	zonesStations[zone.properties.libelle] = {
		nbOfStations,
		nbOfChargingPoints
	};
}

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

/**
 * Return the number of buildings in an urban zone
 * 
 * @param zoneName Urban zone to search into
 */
export function getZoneNbOfBuildings(zoneName: string): number {
	return zonesNbOfBuildings[zoneName];
}

/**
 * Return the area in square meters of the urban zone
 * 
 * @param zoneName Urban zone for which the area should be computed
 */
export function getZoneArea(zoneName: string): number {
	return zonesArea[zoneName];
}

/**
 * Return the number of charging stations and charging points in an urban zone.
 * 
 * @param zoneName Urban zone to search into
 */
export function getZoneChargingStationsData(zoneName: string) {
	return zonesStations[zoneName];
}

/**
 * Return the features section of an urban zone
 * 
 * @param zoneName urban zone for which the feature section shall be returned
 */
function getZone(zoneName: string): Feature<MultiPolygon, ZoneFeatureProperties> {
	return zonesGeoJSON.features.filter(data => data.properties.libelle === zoneName)[0];
}

export function getZonesNames(): string[] {
	return zonesGeoJSON.features.map(zone => zone.properties.libelle);
}

/**
 * Return the number of sites in an urban zone
 * 
 * @param zoneName Urban zone to search into
 * @param profile Building type searched, all if undefined
 */
export function getZoneNbOfCollectionSites(zoneName: string, profile?: ConsumerProfile): number {
	const zone = getZone(zoneName);
	const zoneProperties = zone.properties;

	switch (profile) {
		case ConsumerProfile.RESIDENTIAL:
			return zoneProperties.RES1 + zoneProperties.RES2;
		case ConsumerProfile.PROFESSIONAL:
			return zoneProperties.PRO1 + zoneProperties.PRO2;
		case ConsumerProfile.TERTIARY:
			return zoneProperties.ENT;
		case ConsumerProfile.PUBLIC_LIGHTING:
			return publicLightingGeoJSON.features.filter(publicLighting => turf.booleanWithin(turf.point(publicLighting.geometry.coordinates), zone)).length;
		case ConsumerProfile.ALL:
		default:
			return getZoneNbOfCollectionSites(zoneName, ConsumerProfile.RESIDENTIAL)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PROFESSIONAL)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.TERTIARY)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PUBLIC_LIGHTING)
	}
}
