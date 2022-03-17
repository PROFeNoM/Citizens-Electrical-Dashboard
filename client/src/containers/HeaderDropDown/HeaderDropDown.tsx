import React from 'react';
import './HeaderDropDown.css';
import DropMenu from "../../components/DropMenu/DropMenu";


function HeaderDropDown() {
	return (
		<div className='header-dd-content-wrapper'>
			<div className='header-dd-wrapper'>
				<h1 className='header-dd-title'>tableau électrique citoyen</h1>
			</div>
			<DropMenu/>
		</div>
	);
}

export default HeaderDropDown;