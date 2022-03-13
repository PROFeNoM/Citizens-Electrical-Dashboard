import { FeatureCollection } from 'geojson';
import { updateProperties } from './utils';
import BasicMapModel from '../BasicMap/BasicMapModel';

const json_Decoupage_urbain = require("../../map/layers/Decoupage_urbain.json");
const json_Batiment_Bordeaux_Bastide_TEC = require("../../map/layers/Batiment_Bordeaux_Bastide_TEC.json");

class BalanceMapModel extends BasicMapModel {
	data: FeatureCollection;
	buildingData: FeatureCollection;

	constructor() {
		super();
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