import React, {useEffect, useState} from 'react';
import './DistrictEnergyBalance.css';
import {
	Building,
	getDistrictArea,
	getDistrictElectricityConsumption,
	getDistrictNumberOfBuildings
} from "../../scripts/dbUtils";

function DistrictEnergyBalance() {
	const nbBuilding: number = getDistrictNumberOfBuildings(Building.Residential)
		+ getDistrictNumberOfBuildings(Building.Professional)
		+ getDistrictNumberOfBuildings(Building.Tertiary);

	const area: string = new Intl.NumberFormat().format(Math.round(getDistrictArea()));
	const [elecCons, setElecCons] = useState("");

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01 00:30:00').getTime();
			const t2 = new Date('2021-12-31 23:30:00').getTime();
			const r = new Intl.NumberFormat().format(Math.round(await getDistrictElectricityConsumption(t1, Building.All, t2)));
			setElecCons(r);
		})();
	}, []);

	return (
		<>
			<span className='district-info'>{nbBuilding} bâtiments</span>
			<span className='district-info'>{area} m2</span>
			<span className='district-info'>{elecCons} conso mois dec</span>
		</>
	);
}

export default DistrictEnergyBalance;
