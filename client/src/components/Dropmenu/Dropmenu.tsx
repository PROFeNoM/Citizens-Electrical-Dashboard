import "./Dropmenu.css"
import React from "react";

function Dropmenu() {
  return (
    <div className="dropdown">
      <button className="dropbtn">PRODUCTION</button>
      <div className="dropdown-content">
        <a href="#">Consommation</a>
        <a href="#">Bornes de recharges</a>
      </div>
    </div>
  );
}

export default Dropmenu;
