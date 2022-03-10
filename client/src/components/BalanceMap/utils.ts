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
	featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry>, curentZone: string
): Promise<GeoJSON.FeatureCollection<GeoJSON.Geometry>> {
	const {features} = featureCollection;
	const values = features.map( (item) => {
        if (item.properties.libelle === curentZone)
            return 1;
        else
            return 0;
    });


	return {
		type: 'FeatureCollection',
		features: features.map((f, i) => {
			const properties = {
				...f.properties,
				curentZone: values[i]
			};
			return {...f, properties};
		})
	};
}