import './HomeMap.css';
import React, {useEffect, useState} from 'react';
import {MapContainer as LMap, Polygon, Popup, TileLayer} from 'react-leaflet';

import {
	Building,
	getAllUrbanZone,
	getUrbanZoneArea,
	getUrbanZoneCoordinates,
	getUrbanZoneElectricityConsumption,
	getUrbanZoneElectricityProduction,
	getUrbanZoneLibelle,
	getUrbanZoneNumberOfBuildings,
	UrbanZoneFeature
} from '../../scripts/dbUtils';


// @ts-ignore
const UrbanZoneEnergyBalance = ({item}) => {
	const urbanZone: string = getUrbanZoneLibelle(item);
	const nbBuilding: number = getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential)
		+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional)
		+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary);

	const area: string = new Intl.NumberFormat().format(Math.round(getUrbanZoneArea(urbanZone)));

	const [elecCons, setElecCons] = useState("");
	const [elecProd, setElecProd] = useState("");

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01 00:30:00').getTime();
			const t2 = new Date('2021-12-31 23:30:00').getTime();
			const r = new Intl.NumberFormat().format(Math.round(await getUrbanZoneElectricityConsumption(t1, Building.All, urbanZone, t2)));
			setElecCons(r);
		})();

		(async () => {
			const t1 = new Date('2021-12-01 00:30:00').getTime();
			const t2 = new Date('2021-12-31 23:30:00').getTime();
			const r = new Intl.NumberFormat().format(Math.round(await getUrbanZoneElectricityProduction(t1, urbanZone, t2)));
			setElecProd(r);
		})();
	});

	return (
		<Polygon className="leaflet-area" positions={getUrbanZoneCoordinates(item)}>
			<Popup>
				<h3>{urbanZone}</h3>
				<p>{nbBuilding} bâtiments</p>
				<p>{area} m²</p>
				<p>{elecCons} kWh/mois d'électricité consommée</p>
				<p>{elecProd} kWh/mois d'électricité produite</p>
			</Popup>
		</Polygon>
	);
}

function HomeMap() {

	const UrbanZones = getAllUrbanZone();

	const center = {lat: 44.845615, lng: -0.554897};
	const zoom = 14;

	return (
		<LMap center={center} zoom={zoom}>
			<TileLayer
				attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{UrbanZones.map((item: UrbanZoneFeature) => <UrbanZoneEnergyBalance item={item} />)}
		</LMap>
	);
}


export default HomeMap;