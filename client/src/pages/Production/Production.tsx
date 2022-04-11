import './Production.css';
import React, {useState} from "react";
import {LocalProductionInfo, ProductionChoroplethMap, WeeklyProduction} from '../../components';
import {useParams} from 'react-router-dom';
import HeaderDropDown from '../../containers/HeaderDropDown/HeaderDropDown';
import {Link} from 'react-router-dom';
import chart_ic from '../../images/chart_icon.png';
import i_ic from '../../images/i_icon.png';
import SolarDonut from "../../components/SolarDonut/SolarDonut";

function Production() {
	let params = useParams();

	const [t1, setT1] = useState(new Date('2021-12-01T00:30:00Z').getTime());
	const [t2, setT2] = useState(new Date('2021-12-31T00:30:00Z').getTime());
	const [currentChart, setCurrentChart] = useState(0);

	return (
		<>
			<HeaderDropDown/>
			<div id="production-content" key={window.location.pathname}>

				<div id="graph-container">
					<div id="choropleth-map-wrapper">
						<ProductionChoroplethMap t1={t1} t2={t2}/>
					</div>

					<div key={currentChart} id="chart-wrapper">
						<WeeklyProduction
							t1={t1}
							t2={t2}
							urbanZone={params.zoneName}
							title={'Production hebdomadaire de la zone urbaine par rapport au quartier'}
						/>
						<SolarDonut
							t1={t1}
							t2={t2}
							urbanZone={params.zoneName}
							title={'Répartition des productions solaires'}
						/>
						<LocalProductionInfo
							t1={t1}
							t2={t2}
							urbanZone={params.zoneName}
							title={"Une production locale d'énergie renouvelable"}
						/>
						<>
							<div className="controls">
								{/*<div onClick={this.props.onCancel}>retour</div>-->*/}
								<img id="icons" src={chart_ic} alt="Pictogramme de graphique"/>
								<Link to={'/consommation/' + params.zoneName}>consommation</Link>
								<Link to={'/production/' + params.zoneName}>production</Link>
							</div>
							<div className="controls">
								<img id="icons" src={i_ic} alt="Pictogramme d'information"/>
								<Link to={'/bornes/' + params.zoneName}>bornes de recharges</Link>
							</div>
						</>
					</div>
				</div>
			</div>
		</>
	);
}

export default Production;

