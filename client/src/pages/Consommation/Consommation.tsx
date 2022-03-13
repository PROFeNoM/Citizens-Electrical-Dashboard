import "./Consommation.css";
import React from "react";
import {Col, Container, Row} from "react-bootstrap";
import {ChoroplethMap, HorizontalSliderController} from "../../components";
import Dropmenu from "../../components/Dropmenu/Dropmenu";
import {TotalConsumptionController} from "../../components";

function Consommation() {
	return (
		<>
			<Dropmenu/>
			<div className='consommation-content'>
				<HorizontalSliderController render={(t1, t2) => (
					<Container>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<ChoroplethMap
									t1={t1}
									t2={t2}/>
							</Col>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TotalConsumptionController/>
							</Col>
						</Row>
					</Container>
				)}/>
			</div>
		</>
	);
}

export default Consommation;
