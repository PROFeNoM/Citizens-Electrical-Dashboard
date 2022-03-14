import './HomeMap.css';
import React, { useEffect, useState } from 'react';
import { MapContainer as LMap, Polygon, TileLayer } from 'react-leaflet';
import { Col, Container, Row } from "react-bootstrap";
import {
	Building,
	getAllUrbanZone,
	getUrbanZoneArea,
	getUrbanZoneCoordinates,
	getZoneConsumption,
	getUrbanZoneElectricityProduction,
	getUrbanZoneLibelle,
	getUrbanZoneNumberOfBuildings,
	getUrbanZoneNumberOfSites,
	UrbanZoneFeature
} from '../../scripts/dbUtils';
import {useNavigate} from "react-router-dom";

function updateText(urbanZone: string, nbBuildings: number, nbSites: number, area: number, elecCons: number, elecProd: number) {
	const ratio : number = elecCons !== 0 ? Math.round(elecProd / elecCons * 100) : 0;

	// @ts-ignore
	document.getElementById('urban-zone').innerText = urbanZone;
	// @ts-ignore
	document.getElementById('nb-building').innerText = `${nbBuildings} bâtiments`;
	// @ts-ignore
	document.getElementById('nb-sites').innerText = `${nbSites} consommateurs`;
	// @ts-ignore
	document.getElementById('area').innerText = `${ new Intl.NumberFormat().format(area)} m²`;
	// @ts-ignore
	document.getElementById('elec-cons').innerText = `${ new Intl.NumberFormat().format(elecCons)} MWh/mois d'électricité consommée`;
	// @ts-ignore
	document.getElementById('elec-prod').innerText = `${ new Intl.NumberFormat().format(elecProd)} MWh/mois d'électricité produite`;
	// @ts-ignore
	document.getElementById('ratio-prod-cons').innerText = `${ratio}% ratio production/consommation`;
}

// @ts-ignore
const UrbanZoneEnergyBalance = ({ item }) => {
	let navigate = useNavigate();

	const urbanZone: string = getUrbanZoneLibelle(item);
	const nbSites: number = getUrbanZoneNumberOfSites(urbanZone, Building.Residential)
		+ getUrbanZoneNumberOfSites(urbanZone, Building.Professional)
		+ getUrbanZoneNumberOfSites(urbanZone, Building.Tertiary);
	const nbBuildings: number = getUrbanZoneNumberOfBuildings(urbanZone);

	const area: number = Math.round(getUrbanZoneArea(urbanZone));

	const [elecCons, setElecCons] = useState(0);
	const [elecProd, setElecProd] = useState(0);

	useEffect(() => {
		(async () => {
			const t1 = new Date('2021-12-01T00:30:00Z').getTime();
			const t2 = new Date('2021-12-31T23:30:00Z').getTime();
			const r = Math.round(await getZoneConsumption(t1, Building.All, urbanZone, t2) / 1000 / 1000);
			setElecCons(r);
		})();

		(async () => {
			const t1 = new Date('2021-12-01T00:30:00Z').getTime();
			const t2 = new Date('2021-12-31T23:30:00Z').getTime();
			const r = Math.round(await getUrbanZoneElectricityProduction(t1, urbanZone, t2) / 1000 / 1000);
			setElecProd(r);
		})();
	});

	return (
		<Polygon className="leaflet-area" positions={getUrbanZoneCoordinates(item)}
			eventHandlers={{
				mouseover: () => {
					if (window.innerWidth < 1200) {
						document.getElementById("district-infos").style.display = "none";
						document.getElementById("urban-infos").style.display = "block";
					} else if (document.getElementById("urban-infos").style.display) {
						document.getElementById("urban-infos").style.display = "block";
					}
					updateText(urbanZone, nbBuildings, nbSites, area, elecCons, elecProd);
				},
				mouseout: () => {
					if (window.innerWidth < 1200) {
						document.getElementById("urban-infos").style.display = "none";
						document.getElementById("district-infos").style.display = "block";
					}
				},
				click: () => {
					navigate(`/consommation/${urbanZone}`);
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
		<Container >
			<Row xl={2}>
				<Col sm={{span: 12, order: 'last'}} md={{span: 12, order: 'last'}} xl={{span: 6, order: 'first'}}>
					<LMap center={center} zoom={zoom}>
						<TileLayer
							attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
						/>
						{UrbanZones.map((item: UrbanZoneFeature) => <UrbanZoneEnergyBalance item={item} />)}
					</LMap>
				</Col>
				<Col sm={{span: 12, order: 'first'}} md={{span: 12, order: 'first'}} xl={{span: 6, order: 'last'}}>
					<div id="urban-infos" className="urban-info urban-info-wrapper">
						<h3 id="urban-zone">Choisissez une zone urbaine</h3>
						<p id="nb-building"></p>
						<p id="nb-sites"></p>
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