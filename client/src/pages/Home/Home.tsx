import './Home.css';
import { Header } from '../../containers';
import { Col, Container, Row } from 'react-grid-system';
import { DistrictEnergyBalance } from '../../components';
import HomeMap from '../../components/HomeMap/HomeMap';

function Home() {
    return (
        <>
            <Header title={'ACCUEIL'} />
            <h1 className="app-title">TABLEAU ELECTRIQUE CITOYEN</h1>

            <Container fluid>
                <Row>
                    <Col sm={12} md={12} lg={12} xl={4}>
                        <DistrictEnergyBalance />
                    </Col>
                    <Col sm={12} md={12} lg={12} xl={8}>
                        <HomeMap />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;
