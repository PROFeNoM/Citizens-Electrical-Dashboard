import {GeoJSON} from "geojson";

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