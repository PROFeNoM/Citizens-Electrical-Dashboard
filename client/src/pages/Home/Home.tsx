import './Home.css';
import {Header} from "../../containers";
import {Col, Container, Row} from "react-grid-system";
import { DistrictEnergyBalance } from '../../components';

import HomeMap from '../../components/HomeMap/HomeMap';
function Home() {
    return (
        <>
            <Header title={'ACCUEIL'}/>
            <h1 className="app-title">TABLEAU ELECTRIQUE CITOYEN</h1>
            
            <Container>
                <Row>
                    <Col sm={4}>
                        <h2 className='district-name'>QUARTIER DE LA BASTIDE</h2>
                        <DistrictEnergyBalance/>
                    </Col>
                    <Col sm={4}>
                        <HomeMap />
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Home;