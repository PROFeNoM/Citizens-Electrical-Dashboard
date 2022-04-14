import './Bornes.css';
import HeaderDropDown from '../../containers/HeaderDropDown/HeaderDropDown';
import {HomeMap} from '../../components';
import {Link} from 'react-router-dom';
import chart_ic from '../../images/chart_icon.png';
import i_ic from '../../images/i_icon.png';


function Bornes() {

	return (
		<>
			<HeaderDropDown/>
			<div id="bornes-content" key={window.location.pathname}>

				<div id="bornes-map-wrapper">
					<HomeMap 
                        ref={this.mapRef}
                        // onZoneClick={zoneName => this.setState({ selectedZoneName: zoneName })} 
                    />
				</div>
				<>
							
                    <div className="controls">
						{/*<div onClick={this.props.onCancel}>retour</div>-->*/}
						<img id="icons" src={chart_ic} alt="Pictogramme de graphique"></img>
						<Link to={'/consommation/'}>consommation</Link>
						<Link to={'/production/'}>production</Link>
					</div>
					<div className="controls">
						<img id="icons" src={i_ic} alt="Pictogramme d'information"></img>
						<Link to={'/bornes/'}>bornes de recharges</Link>
					</div>
				</>
					
				
			</div>
		</>
	);
}

export default Bornes;