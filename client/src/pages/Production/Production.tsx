import './Production.css';
import React, {useState} from "react";
import {WeeklyProduction} from '../../components';
import {useParams} from 'react-router-dom';
import HeaderDropDown from '../../containers/HeaderDropDown/HeaderDropDown';
import {Menu, MenuItem, Button} from '@mui/material';
import {ProducerProfile} from '../../scripts/api';
import {Link} from 'react-router-dom';
import chart_ic from '../../images/chart_icon.png';
import i_ic from '../../images/i_icon.png';

function Production() {

	const titles = [
		'Production hebdomadaire de la zone urbaine par rapport au quartier'
	];

	let params = useParams();

	const [isChartOpen, setIsChartOpen] = useState(false);
	const [dropmenu, setDropmenu] = useState(null);
	const [t1, setT1] = useState(new Date('2021-12-01T00:30:00Z').getTime());
	const [t2, setT2] = useState(new Date('2021-12-31T00:30:00Z').getTime());
	const [currentChart, setCurrentChart] = useState(0);

	const open = Boolean(dropmenu);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setDropmenu(event.currentTarget);
	};
	const handleClose = (ind: number) => {
		setDropmenu(null);
		setIsChartOpen(true);
		setCurrentChart(ind);
	};

	return (
		<>
			<HeaderDropDown/>
			<div id="production-content" key={window.location.pathname}/>

			<div id="graph-container">
				<div key={currentChart} id="chart-wrapper">
					<div id="graphs-menus">
						<WeeklyProduction
							t1={t1}
							t2={t2}
							urbanZone={params.zoneName}
							title={titles[currentChart]}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default Production;

