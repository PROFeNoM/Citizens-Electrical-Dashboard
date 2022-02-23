import './HomeMap.css';
import React, {useEffect, useState} from 'react';
import {MapContainer as LMap, Marker, Polygon, Popup, TileLayer} from 'react-leaflet';
import {Col, Container, Row} from "react-grid-system";
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


function change_text(urbanZone: string, nbBuilding: number, area: string, elecCons: string, elecProd: string) {
	// @ts-ignore
	document.getElementById("urbanZone").innerText = urbanZone;
	// @ts-ignore
	document.getElementById("nbBuilding").innerText = `${nbBuilding} bâtiments`;
	// @ts-ignore
	document.getElementById("area").innerText = `${area} m²`;
	// @ts-ignore
	document.getElementById("elecCons").innerText = `${elecCons} kWh/mois d'électricité consommée`;
	// @ts-ignore
	document.getElementById("elecProd").innerText = `${elecProd} kWh/mois d'électricité produite`;
}

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
		<Polygon className="leaflet-area" positions={getUrbanZoneCoordinates(item)}
				 eventHandlers={{
					 mouseover: () => {
						 change_text(urbanZone, nbBuilding, area, elecCons, elecProd);
					 }
				 }}>
		</Polygon>
	);
}

function HomeMap() {

	const UrbanZones = getAllUrbanZone();

	const center = {lat: 44.845615, lng: -0.554897};
	const zoom = 14;

	return (
		<Container>
			<Row >
				<Col sm={12} md={12} xl={6}>
					<LMap center={center} zoom={zoom}>
						<TileLayer
							attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						{UrbanZones.map((item: UrbanZoneFeature) => <UrbanZoneEnergyBalance item={item}/>)}
					</LMap>
				</Col>
				<Col sm={12} md={12} xl={6}>
					<div className='urban-info'>
						<h3 id="urbanZone">Choisissez une zone urbaine</h3>
						<p id="nbBuilding"></p>
						<p id="area"></p>
						<p id="elecCons"></p>
						<p id="elecProd"></p>
					</div>
				</Col>
			</Row>
		</Container>
	);
}


export default HomeMap;