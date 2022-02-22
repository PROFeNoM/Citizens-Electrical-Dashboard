import './HomeMap.css';
import {Link} from "react-router-dom";
import React, { Component } from 'react';
import { render } from 'react-dom';
import { MapContainer as LMap, TileLayer, Marker, Polygon, Popup } from 'react-leaflet';

import { 
  Building,
  UrbanZoneFeature,
  getAllUrbanZone,
  getUrbanZoneCoordinates,
  getUrbanZoneLibelle,
  getUrbanZoneNumberOfBuildings,
  getUrbanZoneArea,
} from '../../scripts/dbUtils';

import DistrictEnergyBalance from '../DistrictEnergyBalance/DistrictEnergyBalance';



function HomeMap() {
  
    const UrbanZones = getAllUrbanZone();
    
    const center = { lat: 44.845615, lng: -0.554897};
    const zoom = 14;
    
    console.log(UrbanZones[0].geometry.coordinates[0][0]);

    return (
      <LMap center={center} zoom={zoom}>
      <TileLayer
        attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {UrbanZones.map((item: UrbanZoneFeature) => {

        const libelle: string = getUrbanZoneLibelle(item);
        const nbBuilding: number = getUrbanZoneNumberOfBuildings(libelle, Building.Residential)
		            + getUrbanZoneNumberOfBuildings(libelle, Building.Professional)
		            + getUrbanZoneNumberOfBuildings(libelle, Building.Tertiary);
        const area: string = new Intl.NumberFormat().format(Math.round(getUrbanZoneArea(libelle)));
        return (
            <Polygon className="leaflet-area" positions={getUrbanZoneCoordinates(item)}>
              <Popup>
                    <h3>{libelle}</h3>
                    <p>{nbBuilding} bâtiments</p>
                    <p>{area} m²</p>


              </Popup>
            </Polygon>
            );

      })}
      </LMap>
    );
}


export default HomeMap;