import "./DropMenu.css"
import React from "react";
import {DropMenuData1, DropMenuData2, DropMenuData3} from "./DropMenuData"
import {Link, useLocation} from "react-router-dom";
import {IoIosArrowDown} from "react-icons/io";
import {useState} from "react"


function DropMenu() {
	const [dropmenu1, setDropmenu1] = useState(false)

	const showDropmenu1 = () => setDropmenu1(!dropmenu1)

	const [dropmenu2, setDropmenu2] = useState(false)

	const showDropmenu2 = () => setDropmenu2(!dropmenu2)

	const [dropmenu3, setDropmenu3] = useState(false)

	const showDropmenu3 = () => setDropmenu3(!dropmenu3)

	const currentPage = useLocation().pathname.split('/')[1];
	const currentUrbanZone = useLocation().pathname.split('/')[2];
	const currentBuilding = useLocation().pathname.split('/')[3];

	return (
		<>
			<div className='dropmenus-wrapper'>
				<div className='dropmenu-page-wrapper'>
					<div className='dropButton'>
						<IoIosArrowDown onClick={showDropmenu1}/>
					</div>
					<div className='dropmenu-page-title'>{currentPage}</div>
					<div className='dropmenu-wrapper'>
						<nav className={dropmenu1 ? 'dropmenu active' : 'dropmenu'}>
							<ul className='dropmenu-items' onClick={showDropmenu1}>
								{DropMenuData1.map((item, index) => {
									return (
										<li key={index} className={item.cName}>
											<Link to={`${item.path}/${currentUrbanZone}/${currentBuilding}`}>
												<img className="icons" src={item.icon}></img>
												<span className='item-title-dd'>{item.title}</span>
											</Link>
										</li>
									)
								})}
							</ul>
						</nav>
					</div>
				</div>
				<div className='dropmenu-urbanZone-wrapper'>
					<div className='dropButton'>
						<IoIosArrowDown onClick={showDropmenu2}/>
					</div>
					<div className='dropmenu-urbanZone-title'>{currentUrbanZone.replaceAll('%20', ' ')}</div>
					<div className='dropmenu-wrapper'>
						<nav className={dropmenu2 ? 'dropmenu d2 active' : 'dropmenu d2'}>
							<ul className='dropmenu-items' onClick={showDropmenu2}>
								{DropMenuData2.map((item, index) => {
									return (
										<li key={index} className={item.cName}>
											<Link to={`/${currentPage}/${item.path}/${currentBuilding}`}>
												<span className='item-title-dd'>{item.title}</span>
											</Link>
										</li>
									)
								})}
							</ul>
						</nav>
					</div>
				</div>
				<div className='dropmenu-buildings-wrapper'>
					<div className='dropButton'>
						<IoIosArrowDown onClick={showDropmenu3}/>
					</div>
					<div className='dropmenu-buildings-title'>{currentBuilding}</div>
					<div className='dropmenu-wrapper'>
						<nav className={dropmenu3 ? 'dropmenu d3 active' : 'dropmenu d3'}>
							<ul className='dropmenu-items' onClick={showDropmenu3}>
								{DropMenuData3.map((item, index) => {
									return (
										<li key={index} className={item.cName}>
											<Link to={`/${currentPage}/${currentUrbanZone}/${item.path}`}>
												<span className='item-title-dd'>{item.title}</span>
											</Link>
										</li>
									)
								})}
							</ul>
						</nav>
					</div>
				</div>
			</div>
		</>
	);
}

export default DropMenu;