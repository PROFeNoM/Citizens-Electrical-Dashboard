import './Consumption.css';
import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { ChoroplethMap, TotalConsumption, TypicalConsumptionDay, } from '../../components';
import { useParams } from 'react-router-dom';
import HeaderDropDown from '../../containers/HeaderDropDown/HeaderDropDown';
import { Menu, MenuItem, Button } from '@mui/material';
import { ConsumerProfile } from '../../scripts/api';

function Consumption() {
	const buildingTypes = [
		undefined,
		ConsumerProfile.RESIDENTIAL,
		ConsumerProfile.TERTIARY,
		ConsumerProfile.PROFESSIONAL,
		ConsumerProfile.PUBLIC_LIGHTING,
	];

	const labels = [
		'Total',
		'Résidentiels',
		'Tértiaires',
		'Professionnels',
		'Eclairage',
	];

	const titles = [
		'Consommation quotidienne moyenne de la zone urbaine par rapport au quartier',
		'Consommation quotidienne moyenne résidentielle de la zone urbaine par rapport au quartier',
		'Consommation quotidienne moyenne tertiaire de la zone urbaine par rapport au quartier',
		'Consommation quotidienne moyenne professionelle de la zone urbaine par rapport au quartier',
		'Consommation quotidienne moyenne des dispositifs d\'éclairage public de la zone urbaine par rapport au quartier',
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
			<HeaderDropDown />
			<div id="consumption-content" key={window.location.pathname}>
				<div id="graphs-menus">
					<Button
						sx={{
							backgroundColor: '#FFFFFF',
						}}
						className="basic-button"
						aria-controls={open ? 'basic-menu' : undefined}
						aria-haspopup='true'
						aria-expanded={open ? 'true' : undefined}
						onClick={handleClick}
					>
						CHOISISSEZ UNE FILIERE
					</Button>
					<Menu
						id="basic-menu"
						anchorEl={dropmenu}
						open={open}
						onClose={() => handleClose(currentChart)}
						MenuListProps={{
							'aria-labelledby': 'basic-button',
						}}
					>
						{labels.map((item, index) => {
							return (
								<div>
									<MenuItem
										onClick={() => handleClose(index)}
										sx={{
											color: '#00A3E0',
										}}
									>
										{item}
									</MenuItem>
								</div>
							);
						})}
					</Menu>
				</div>
			</div>
			<div id="graph-container">
				<div id="chropleth-map-wrapper">
				<ChoroplethMap t1={t1} t2={t2} />
				</div>
				{/* <TotalConsumption
					t1={t1}
					t2={t2}
					urbanZone={params.zoneName}
					title="Consommation par filière"
				/> */}

				<div key={currentChart} id="chart-wrapper">
					<TypicalConsumptionDay
						t1={t1}
						t2={t2}
						urbanZone={params.zoneName}
						buildingType={buildingTypes[currentChart]}
						title={titles[currentChart]}
					/>
				</div>
			</div>
		</>
	);
}

export default Consumption;