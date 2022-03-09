import MapModel, {MapState} from "../MapboxMap/MapboxMapModel";
import {FeatureCollection} from "geojson";
import {json_Decoupage_urbain} from "../../map/layers/Decoupage_urbain";
import {json_Batiment_Bordeaux_Bastide_TEC} from "../../map/layers/Batiment_Bordeaux_Bastide_TEC";
import {updateProperties} from "./utils";
import {Building, getUrbanZoneElectricityConsumption} from "../../scripts/dbUtils";

export interface BalanceMapState {
	mapModel: MapState;
	data: FeatureCollection;
	buildingData: FeatureCollection;
	updateData: (callback: () => void) => void;
}

class BalanceMapModel implements BalanceMapState {
	mapModel: MapState;
	data: FeatureCollection;
	buildingData: FeatureCollection;

	constructor() {
		this.mapModel = new MapModel();
		this.data = json_Decoupage_urbain as FeatureCollection;
		this.buildingData = json_Batiment_Bordeaux_Bastide_TEC as FeatureCollection;
	}

	updateData(callback) {
		(async () => {
			callback();
		})();

	}
}

export default BalanceMapModel;