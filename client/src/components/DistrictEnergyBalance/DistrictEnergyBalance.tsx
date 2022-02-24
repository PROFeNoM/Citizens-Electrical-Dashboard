import { useEffect, useState } from 'react';
import './DistrictEnergyBalance.css';
import {
	Building,
	getDistrictArea,
	getDistrictElectricityConsumption,
	getDistrictElectricityProduction,
	getDistrictNumberOfBuildings
} from "../../scripts/dbUtils";

function DistrictEnergyBalance() {
	const nbBuilding: number = getDistrictNumberOfBuildings(Building.Residential)
		+ getDistrictNumberOfBuildings(Building.Professional)
		+ getDistrictNumberOfBuildings(Building.Tertiary);

	const area: string = new Intl.NumberFormat().format(Math.round(getDistrictArea()));
	const [elecCons, setElecCons] = useState(0);
	const [elecProd, setElecProd] = useState(0);

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getDistrictElectricityConsumption(t1, Building.All, t2));
			setElecCons(r);
		})();
	});

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getDistrictElectricityProduction(t1, t2));
			setElecProd(r);
		})();
	});

	const ratio: number = elecCons !== 0 ? Math.round(elecProd / elecCons * 100) : 0;

	return (
		<div id="district-infos">
			<h2 id="district-name">Quartier de la Bastide</h2>
			<p>{nbBuilding} bâtiments</p>
			<p>{area} m²</p>
			<p>{new Intl.NumberFormat().format(elecCons)} kWh/mois d'électricité consommée</p>
			<p>{new Intl.NumberFormat().format(elecProd)} kWh/mois d'électricité produite</p>
			<p>{ratio}% ratio production/consommation</p>
		</div>
	);
}

export default DistrictEnergyBalance;
