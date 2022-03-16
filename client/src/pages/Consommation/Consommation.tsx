import './Consommation.css';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ChoroplethMap, HorizontalSlider, TypicalConsumptionDay } from '../../components';
import Dropmenu from '../../components/Dropmenu/Dropmenu';
import { TotalConsumption } from '../../components';
import { useParams } from 'react-router-dom';
import {Building} from "../../scripts/dbUtils";

function Consommation() {
	let params = useParams();

	return (
		<>
			<Dropmenu />
			<div className='consommation-content'>
				<HorizontalSlider children={(t1, t2) => (
					<Container>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<ChoroplethMap
									t1={t1}
									t2={t2} />
							</Col>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TotalConsumption 
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									title={"Consommation par filière"}/>
							</Col>
						</Row>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									buildingType={Building.All}
									title={"Consommation quotidienne moyenne de la zone urbaine par rapport au quartier"}
								/>
							</Col>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									buildingType={Building.Residential}
									title={"Consommation quotidienne moyenne résidentielle de la zone urbaine par rapport au quartier"}
								/>
							</Col>
						</Row>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									buildingType={Building.Tertiary}
									title={"Consommation quotidienne moyenne tertiare de la zone urbaine par rapport au quartier"}
								/>
							</Col>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									buildingType={Building.Professional}
									title={"Consommation quotidienne moyenne professionelle de la zone urbaine par rapport au quartier"}
								/>
							</Col>
						</Row>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
									buildingType={Building.Lighting}
									title={"Consommation quotidienne moyenne des dispositifs d'éclairage public de la zone urbaine par rapport au quartier"}
								/>
							</Col>
						</Row>
					</Container>
				)} />
			</div>
		</>
	);
}

export default Consommation;
