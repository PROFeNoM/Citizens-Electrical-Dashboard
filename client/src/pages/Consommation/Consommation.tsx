import "./Consommation.css";
import { Header } from "../../containers";
import { Col, Container, Row } from "react-bootstrap";
import { ChoroplethMapController, DistrictEnergyBalance } from "../../components";
import HomeMap from "../../components/HomeMap/HomeMap";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import { Dropdown } from "react-bootstrap";
import Dropmenu from "../../components/Dropmenu/Dropmenu";
import { TotalConsumptionController } from "../../components";
function Consommation() {
  return (
    <>
        <Dropmenu />
        <Container>
                <Row>
                    <Col sm={12} md={12} lg={12} xl={6}>
                        <ChoroplethMapController />
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={6}>
                        <TotalConsumptionController />
                    </Col>
                </Row>
            </Container>
    </>
  );
}

export default Consommation;
