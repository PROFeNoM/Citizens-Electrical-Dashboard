import "./Consommation.css";
import React from "react";
import {Header} from "../../containers";
import {Col, Container, Row} from "react-bootstrap";
import {ChoroplethMapController, DistrictEnergyBalance, HorizontalSliderController} from "../../components";
import HomeMap from "../../components/HomeMap/HomeMap";
import DropdownMenu from "react-bootstrap/esm/DropdownMenu";
import {Dropdown} from "react-bootstrap";
import DropMenu from "../../components/DropMenu/DropMenu";
import {TotalConsumptionController} from "../../components";

function Consommation() {
	return (
		<>
			<DropMenu />
			<div className='consommation-content'>
				<HorizontalSliderController render={(t1, t2) => (
					<React.Fragment>
						<Container>
							<Row>
								<Col sm={12} md={12} lg={12} xl={6}>
									<ChoroplethMapController
										t1={t1}
										t2={t2}/>
								</Col>
								<Col sm={12} md={12} lg={12} xl={6}>
									<TotalConsumptionController/>
								</Col>
							</Row>
						</Container>
					</React.Fragment>
				)}/>
			</div>
		</>
	);
}

export default Consommation;
