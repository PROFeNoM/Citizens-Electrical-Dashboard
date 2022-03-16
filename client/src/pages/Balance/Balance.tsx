import './Balance.css';
import { Header } from '../../containers';
import { Col, Container, Row } from 'react-bootstrap';
import UrbanZoneEnergyBalance from '../../components/UrbanZoneEnergyBalance/UrbanZoneEnergyBalance';
import BalanceMap from '../../components/Maps/BalanceMap/BalanceMap';
import { Link, useParams } from 'react-router-dom';

function Balance() {

    const params = useParams();

    return (
        <>
            <Header title={'BILAN'} />
            <h2 id="zone-name">{params.zoneName}</h2>
            <Container>
                <Row>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <div id="balance">
                            {<UrbanZoneEnergyBalance name={params.zoneName} />}

                        </div>
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <div id="map">
                            <BalanceMap currentZone={params.zoneName} />
                        </div>
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <Container id="link-items">
                            <Row className="link-item">
                                <Link to={`/consommation/${params.zoneName}`}>Consommation</Link>
                            </Row>
                            <Row className="link-item">
                                <Link to={`/production/${params.zoneName}`}>Production</Link>
                            </Row>
                            <Row className="link-item">
                                <Link to={`/bornes/${params.zoneName}`}>Bornes de recharges</Link>
                            </Row>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Balance;