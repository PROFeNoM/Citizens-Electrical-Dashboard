import './Home.css';
import { Header } from '../../containers';
import { HomeMap } from '../../components';

function Home() {
    return (
        <div id='home-container'>
            <Header title={'ACCUEIL'} />
            <HomeMap />
        </div>
    );
}

export default Home;
