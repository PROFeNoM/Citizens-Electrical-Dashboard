import {GeoJSON} from "geojson";

// Convert a value from one range to another
function changeRange(n: number, minOld: number, maxOld: number, minNew: number, maxNew: number) {
	if (n > maxOld)
		return maxNew;
	if (n < minOld)
		return minNew;
	if (minOld === maxOld)
		return minNew;  // Arbitrary choice; could have been maxNew as well
	return ((n - minOld) / (maxOld - minOld)) * (maxNew - minNew) + minNew;
}

export async function updateProperties(
	featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry>,
	accessor: (f: GeoJSON.Feature<GeoJSON.Geometry>) => Promise<number>,
	minDomainRange: number = 0,
	maxDomainRange: number = 8
): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry>> {
	const {features} = featureCollection;
	const values = await Promise.all(features.map(async (f) => await accessor(f)));
	const minValue = Math.min(...values);
	const maxValue = Math.max(...values);

	return {
		type: 'FeatureCollection',
		features: features.map((f, i) => {
			const value = Math.round(changeRange(values[i], minValue, maxValue, minDomainRange, maxDomainRange));
			const properties = {
				...f.properties,
				choroplethValue: value
			};
			return {...f, properties};
		})
	};
}