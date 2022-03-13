import React from 'react';
import './About.css';
import {Header} from "../../containers";
import {ChoroplethMap, HorizontalSliderController} from "../../components"

function About() {
	return (
		<><Header title={'À PROPOS'}/>
			<div className='test'>
				<HorizontalSliderController render={(t1, t2) => (
					<ChoroplethMap t1={t1} t2={t2}/>
				)}/>
			</div>

		</>
	);
}

export default About;