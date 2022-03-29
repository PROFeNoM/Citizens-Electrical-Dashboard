import { Zone } from './validation';

const districtMultiplier = 6.844538780350843e-8;
const zonesMultiplier = {
	'Bastide Niel': 2.947472857477662e-9,
	'Quartier historique Nord Thiers': 3.347582295144313e-9,
	'Coeur de Bastide': 1.0509541229377365e-8,
	'sieges sociaux': 4.667943439444262e-10,
	'residence autre quai': 4.521236645633156e-9,
	'batiments publics': 3.867724564110959e-10,
	'batiments professionnels et residentiels': 3.0808426700332125e-9,
	'mixte urbain': 9.762670279066284e-9,
	'quartier historique sud avenue thiers': 3.222214671342096e-8,
};

export function regionDataToDistrictData(data: number): number {
	return Math.round(data * districtMultiplier * 250000);
}

export function regionDataToZoneData(zone: Zone, data: number): number {
	return Math.round(data * zonesMultiplier[zone] * 250000);
}
