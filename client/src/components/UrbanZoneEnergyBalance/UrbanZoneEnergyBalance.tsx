import { useEffect, useState } from 'react';
import './UrbanZoneEnergyBalance.css';
import { getZoneArea, getZoneNbOfBuildings, getZoneNbOfCollectionSites, } from '../../scripts/dbUtils';
import { ConsumerProfile, getTotalConsumption, getTotalProduction } from '../../scripts/api';

interface Props {
	name: string;
}

function UrbanZoneEnergyBalance(props: Props) {
	const nbSites: number = getZoneNbOfCollectionSites(props.name, ConsumerProfile.RESIDENTIAL)
		+ getZoneNbOfCollectionSites(props.name, ConsumerProfile.PROFESSIONAL)
		+ getZoneNbOfCollectionSites(props.name, ConsumerProfile.TERTIARY);
	const nbBuildings: number = getZoneNbOfBuildings(props.name);
	const area: string = new Intl.NumberFormat().format(Math.round(getZoneArea(props.name)));
	
	const [elecCons, setElecCons] = useState(0);
	const [elecProd, setElecProd] = useState(0);

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getTotalConsumption(t1, t2, undefined, props.name) / 1000 / 1000);
			setElecCons(r);
		})();
	});

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00').getTime();
			const t2 = new Date('2021-12-31T23:30:00').getTime();
			const r = Math.round(await getTotalProduction(t1, t2, undefined, props.name) / 1000 / 1000);
			setElecProd(r);
		})();
	});

	const ratio: number = elecCons !== 0 ? Math.round(elecProd / elecCons * 100) : 0;

	return (
		<div id="balance-infos">
			<p>{nbBuildings} bâtiments</p>
			<p>{nbSites} consommateurs</p>
			<p>{area} m²</p>
			<p>{new Intl.NumberFormat().format(elecCons)} MWh/mois d'électricité consommée</p>
			<p>{new Intl.NumberFormat().format(elecProd)} MWh/mois d'électricité produite</p>
			<p>{ratio}% ratio production/consommation</p>
		</div>
	);
}

export default UrbanZoneEnergyBalance;
