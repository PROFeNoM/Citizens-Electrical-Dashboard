import './Balance.css';
import { Header } from '../../containers';
import { Col, Container, Row } from 'react-bootstrap';
// import EnergyBalance from '../../components/EnergyBalance/EnergyBalance';
import { Link } from "react-router-dom";
import BalanceMapController from '../../components/BalanceMap/BalanceMapController';

function Home() {
    return (
        <>
            <Header title={'BILAN'} />
            <h2 id="zone-name">{"<Nom de la zone>"}</h2>

            <Container>
                <Row>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <div id="balance">
                            {/*<EnergyBalance />*/}
                            
                        </div>
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <div id="map">
                           <BalanceMapController />
                        </div>
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <div id='nav-items'>
                            <ul>
                                <li>
                                    <Link to={'/production'}>Production</Link>
                                </li>
                                <li>
                                    <Link to={'/consommation'}>Consommation</Link>
                                </li>
                                <li>
                                    <Link to={'/bornes'}>Bornes de recharges</Link>
                                </li>
                            </ul>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;
