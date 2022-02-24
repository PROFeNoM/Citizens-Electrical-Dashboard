import './HomeMap.css';
import React, { useEffect, useState } from 'react';
import { MapContainer as LMap, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import { Col, Container, Row } from "react-grid-system";
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


function updateText(urbanZone: string, nbBuilding: number, area: number, elecCons: number, elecProd: number) {
	const ratio : number = elecCons !== 0 ? Math.round(elecProd / elecCons * 100) / 100 : 0;

	// @ts-ignore
	document.getElementById('urban-zone').innerText = urbanZone;
	// @ts-ignore
	document.getElementById('nb-building').innerText = `${nbBuilding} bâtiments`;
	// @ts-ignore
	document.getElementById('area').innerText = `${ new Intl.NumberFormat().format(area)} m²`;
	// @ts-ignore
	document.getElementById('elec-cons').innerText = `${ new Intl.NumberFormat().format(elecCons)} kWh/mois d'électricité consommée`;
	// @ts-ignore
	document.getElementById('elec-prod').innerText = `${ new Intl.NumberFormat().format(elecProd)} kWh/mois d'électricité produite`;
	// @ts-ignore
	document.getElementById('ratio-prod-cons').innerText = `${ratio}% ratio production/consommation`;
}

// @ts-ignore
const UrbanZoneEnergyBalance = ({ item }) => {
	const urbanZone: string = getUrbanZoneLibelle(item);
	const nbBuilding: number = getUrbanZoneNumberOfBuildings(urbanZone, Building.Residential)
		+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Professional)
		+ getUrbanZoneNumberOfBuildings(urbanZone, Building.Tertiary);

	const area: number = Math.round(getUrbanZoneArea(urbanZone));

	const [elecCons, setElecCons] = useState(0);
	const [elecProd, setElecProd] = useState(0);

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00Z').getTime();
			const t2 = new Date('2021-12-31T23:30:00Z').getTime();
			const r =Math.round(await getUrbanZoneElectricityConsumption(t1, Building.All, urbanZone, t2));
			setElecCons(r);
		})();

		(async () => {
			const t1 = new Date('2021-12-01T00:30:00Z').getTime();
			const t2 = new Date('2021-12-31T23:30:00Z').getTime();
			const r = Math.round(await getUrbanZoneElectricityProduction(t1, urbanZone, t2));
			setElecProd(r);
		})();
	});

	return (
		<Polygon className="leaflet-area" positions={getUrbanZoneCoordinates(item)}
			eventHandlers={{
				mouseover: () => {
					updateText(urbanZone, nbBuilding, area, elecCons, elecProd);
				}
			}}>
		</Polygon>
	);
}

function HomeMap() {

	const UrbanZones = getAllUrbanZone();

	const center = { lat: 44.845615, lng: -0.554897 };
	const zoom = 14;

	return (
		<Container>
			<Row >
				<Col sm={12} md={12} xl={6}>
					<LMap center={center} zoom={zoom}>
						<TileLayer
							attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
						/>
						{UrbanZones.map((item: UrbanZoneFeature) => <UrbanZoneEnergyBalance item={item} />)}
					</LMap>
				</Col>
				<Col sm={12} md={12} xl={6}>
					<div className="urban-info">
						<h3 id="urban-zone">Choisissez une zone urbaine</h3>
						<p id="nb-building"></p>
						<p id="area"></p>
						<p id="elec-cons"></p>
						<p id="elec-prod"></p>
						<p id="ratio-prod-cons"></p>
					</div>
				</Col>
			</Row>
		</Container>
	);
}


export default HomeMap;