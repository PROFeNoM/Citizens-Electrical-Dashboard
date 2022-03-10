import "./Consommation.css";
import { Header } from "../../containers";
import { Col, Container, Row } from "react-bootstrap";
import { ChoroplethMapController, DistrictEnergyBalance } from "../../components";
import HomeMap from "../../components/HomeMap/HomeMap";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import { Dropdown } from "react-bootstrap";
import Dropmenu from "../../components/Dropmenu/Dropmenu";
function Consommation() {
  return (
    <>
        <Dropmenu />
    </>
  );
}

export default Consommation;
