import MapModel, {MapState} from "../MapboxMap/MapboxMapModel";
import {FeatureCollection} from "geojson";
import {updateProperties} from "./utils";

const json_Decoupage_urbain = require("../../map/layers/Decoupage_urbain.json");
const json_Batiment_Bordeaux_Bastide_TEC = require("../../map/layers/Batiment_Bordeaux_Bastide_TEC.json");

export interface BalanceMapState {
	mapModel: MapState;
	data: FeatureCollection;
	buildingData: FeatureCollection;
	updateData: (callback: () => void, curentZone: string) => void;
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

	updateData(callback, curentZone) {
		(async () => {
			this.data = await updateProperties(json_Decoupage_urbain as FeatureCollection, curentZone);
			callback();
		})();

	}
}

export default BalanceMapModel;