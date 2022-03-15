import './Consommation.css';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ChoroplethMap, HorizontalSlider, TypicalConsumptionDay } from '../../components';
import Dropmenu from '../../components/Dropmenu/Dropmenu';
import { TotalConsumption } from '../../components';
import { useParams } from 'react-router-dom';

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
								<TotalConsumption />
							</Col>
						</Row>
						<Row>
							<Col sm={12} md={12} lg={12} xl={6}>
								<TypicalConsumptionDay
									t1={t1}
									t2={t2}
									urbanZone={params.zoneName}
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
