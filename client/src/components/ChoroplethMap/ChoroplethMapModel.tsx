import {FeatureCollection} from "geojson";
import {updateProperties} from "./utils";
import {Building, getUrbanZoneElectricityConsumption} from "../../scripts/dbUtils";
import BasicMapModel from '../BasicMap/BasicMapModel';

const json_Decoupage_urbain = require("../../map/layers/Decoupage_urbain.json");
const json_Batiment_Bordeaux_Bastide_TEC = require("../../map/layers/Batiment_Bordeaux_Bastide_TEC.json");

class ChoroplethMapModel extends BasicMapModel {
	data: FeatureCollection;
	buildingData: FeatureCollection;

	constructor() {
		super();
		this.data = json_Decoupage_urbain as FeatureCollection;
		this.buildingData = json_Batiment_Bordeaux_Bastide_TEC as FeatureCollection;
	}

	updateData(t1: number, t2: number, callback) {
		console.log("[DEBUG]: updateData called");
		(async () => {
			this.data = await updateProperties(
				json_Decoupage_urbain as FeatureCollection,
				async f => getUrbanZoneElectricityConsumption(t1, Building.All, f.properties.libelle, t2));
			callback();
		})();
	}
}

export default ChoroplethMapModel;