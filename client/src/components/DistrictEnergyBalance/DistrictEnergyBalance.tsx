import { useEffect, useState } from 'react';
import './DistrictEnergyBalance.css';
import {
	Building,
	getDistrictArea,
	getDistrictElectricityConsumption,
	getDistrictElectricityProduction,
	getDistrictNumberOfBuildings,
	getDistrictNumberOfSites
} from "../../scripts/dbUtils";

function DistrictEnergyBalance() {
	const nbSites: number = getDistrictNumberOfSites(Building.Residential)
		+ getDistrictNumberOfSites(Building.Professional)
		+ getDistrictNumberOfSites(Building.Tertiary);
	const nbBuildings: number = getDistrictNumberOfBuildings();
	const area: string = new Intl.NumberFormat().format(Math.round(getDistrictArea()));
	const [elecCons, setElecCons] = useState(0);
	const [elecProd, setElecProd] = useState(0);

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getDistrictElectricityConsumption(t1, Building.All, t2) / 1000 / 1000);
			setElecCons(r);
		})();
	});

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getDistrictElectricityProduction(t1, t2) / 1000 / 1000);
			setElecProd(r);
		})();
	});

	const ratio: number = elecCons !== 0 ? Math.round(elecProd / elecCons * 100) : 0;

	return (
		<div id="district-infos">
			<h2 id="district-name">Quartier de la Bastide</h2>
			<p>{nbBuildings} bâtiments</p>
			<p>{nbSites} consommateurs</p>
			<p>{area} m²</p>
			<p>{new Intl.NumberFormat().format(elecCons)} MWh/mois d'électricité consommée</p>
			<p>{new Intl.NumberFormat().format(elecProd)} MWh/mois d'électricité produite</p>
			<p>{ratio}% ratio production/consommation</p>
		</div>
	);
}

export default DistrictEnergyBalance;
