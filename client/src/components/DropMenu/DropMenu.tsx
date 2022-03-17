import "./DropMenu.css"
import React from "react";
import {DropMenuData, DropMenuData2} from "./DropMenuData"
import {Link, useLocation} from "react-router-dom";
import {IoIosArrowDown} from "react-icons/io";
import {useState} from "react"

function DropMenu() {
	const [dropmenu, setDropmenu] = useState(false)

	const showDropmenu = () => setDropmenu(!dropmenu)

	const [dropmenu2, setDropmenu2] = useState(false)

	const showDropmenu2 = () => setDropmenu2(!dropmenu2)

	const currentPage = useLocation().pathname.split('/')[1];
	const currentUrbanZone = useLocation().pathname.split('/')[2];

	return (
		<>
			<div className='dropmenus-wrapper'>
				<div className='dropmenu-page-wrapper'>
					<div className='dropButton'>
						<IoIosArrowDown onClick={showDropmenu}/>
					</div>
					<div className='dropmenu-page-title'>{currentPage}</div>
					<div className='dropmenu-wrapper'>
						<nav className={dropmenu ? 'dropmenu active' : 'dropmenu'}>
							<ul className='dropmenu-items' onClick={showDropmenu}>
								{DropMenuData.map((item, index) => {
									return (
										<li key={index} className={item.cName}>
											<Link to={`${item.path}/${currentUrbanZone}`}>
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
											<Link to={`/${currentPage}/${item.path}`}>
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