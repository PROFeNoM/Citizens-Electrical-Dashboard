import MapModel, {MapState} from "../MapboxMap/MapboxMapModel";
import {FeatureCollection} from "geojson";
import {json_Decoupage_urbain} from "../../map/layers/Decoupage_urbain";
import {json_Batiment_Bordeaux_Bastide_TEC} from "../../map/layers/Batiment_Bordeaux_Bastide_TEC";
import {updateProperties} from "./utils";
import {Building, getUrbanZoneElectricityConsumption} from "../../scripts/dbUtils";

export interface ChoroplethMapState {
	mapModel: MapState;
	data: FeatureCollection;
	buildingData: FeatureCollection;
	updateData: (callback: () => void) => void;
}

class ChoroplethMapModel implements ChoroplethMapState {
	mapModel: MapState;
	data: FeatureCollection;
	buildingData: FeatureCollection;

	constructor() {
		this.mapModel = new MapModel();
		this.data = json_Decoupage_urbain as FeatureCollection;
		this.buildingData = json_Batiment_Bordeaux_Bastide_TEC as FeatureCollection;
	}

	updateData(callback) {
		const t1 = new Date('2021-12-01T00:30:00Z').getTime();
		const t2 = new Date('2021-12-31T23:30:00Z').getTime();
		(async () => {
			this.data = await updateProperties(json_Decoupage_urbain as FeatureCollection, async f => getUrbanZoneElectricityConsumption(t1, Building.All, f.properties.libelle, t2));
			callback();
		})();

	}
}

export default ChoroplethMapModel;