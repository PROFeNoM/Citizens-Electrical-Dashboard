import React from 'react';
import './HeaderDropDown.css';
import DropMenu from "../../components/DropMenu/DropMenu";
import { Link } from 'react-router-dom';

function HeaderDropDown() {
	return (
		<div className='header-dd-content-wrapper'>
			<div className='header-dd-wrapper'>
				<Link to='/'><h1 className='header-dd-title'>tableau électrique citoyen</h1></Link>
			</div>
			<DropMenu/>
		</div>
	);
}

export default HeaderDropDown;