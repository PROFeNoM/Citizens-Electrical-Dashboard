import * as turf from '@turf/turf';
import { buildingsGeoJSON, zonesGeoJSON, publicLightingGeoJSON, ZoneFeatureProperties } from 'geodata';
import { Feature, MultiPolygon } from 'geojson';
import { ConsumerProfile } from './api';

const zonesNbOfBuildings: Record<string, number> = {};
for (const zone of zonesGeoJSON.features) {
	zonesNbOfBuildings[zone.properties.libelle] = buildingsGeoJSON.features.filter(building => isContained(zone, building)).length;
}

const zonesArea: Record<string, number> = {};
for (const zone of zonesGeoJSON.features) {
	zonesArea[zone.properties.libelle] = turf.area(zone);
}

// FIXME client shouldn't have to compute that, client shouldn't have to compute anything
/** Exactly like booleanContains of @turf/turf, but it works with MultiPolygon. */
function isContained(feature1: Feature<MultiPolygon, any>, feature2: Feature<MultiPolygon, any>) {
	// each "for" will loop only once if the given features are made of only one polygon each (which is most likely the case)
	for (const polygon1 of feature1.geometry.coordinates) {
		for (const polygon2 of feature2.geometry.coordinates) {
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
 * @param zoneName Urban zone to search into
 */
export function getZoneNbOfBuildings(zoneName: string): number {
	return zonesNbOfBuildings[zoneName];
}

/**
 * Return the area in square meters of the urban zone
 * @param zoneName Urban zone for which the area should be computed
 */
export function getZoneArea(zoneName: string): number {
	return zonesArea[zoneName];
}

/**
 * Return the features section of an urban zone
 * @param zoneName Urban Zone for which the feature section shall be returned
 */
function getZone(zoneName: string): Feature<MultiPolygon, ZoneFeatureProperties> {
	return zonesGeoJSON.features.filter(data => data.properties.libelle === zoneName)[0];
}

export function getZonesNames(): string[] {
	return zonesGeoJSON.features.map(zone => zone.properties.libelle);
}

/**
 * Return the number of sites in an urban zone
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
			return publicLightingGeoJSON.filter(pl => turf.booleanWithin(turf.point(pl.geometry.coordinates), zone)).length;
		default:
			return getZoneNbOfCollectionSites(zoneName, ConsumerProfile.RESIDENTIAL)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PROFESSIONAL)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.TERTIARY)
				+ getZoneNbOfCollectionSites(zoneName, ConsumerProfile.PUBLIC_LIGHTING)
	}
}
