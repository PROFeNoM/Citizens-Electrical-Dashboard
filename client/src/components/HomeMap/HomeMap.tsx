import './HomeMap.css';
import {Link} from "react-router-dom";
import React, { Component } from 'react';
import { render } from 'react-dom';
import { MapContainer as LMap, TileLayer, Marker, Polyline } from 'react-leaflet';
const decoup = require('./../../map/layers/Decoupage_urbain');


function HomeMap() {
  
    const center = { lat: 44.845615, lng: -0.554897};
    const zoom = 14;
    
    console.log(decoup.json_Decoupage_urbain.features[0].geometry.coordinates[0][0]);

    return (
      <LMap center={center} zoom={zoom}>
      <TileLayer
        attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {decoup.json_Decoupage_urbain.features.map((item: any) => {
          console.log(item);
          item.geometry.coordinates[0][0].map((item: Float32Array) => {
            var tmp = item[0];
            item[0] = item[1];
            item[1] = tmp;
          })
        return (
            <Polyline positions={item.geometry.coordinates[0][0]} />
            );

      })}
      </LMap>
    );
}


export default HomeMap;