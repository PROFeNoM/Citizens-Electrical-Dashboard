import React from 'react';
import './About.css';
import {Header} from "../../containers";
import {ChoroplethMapController, HorizontalSliderController} from "../../components"

function About() {
	return (
		<><Header title={'À PROPOS'}/>
			<div className='test'>
				<HorizontalSliderController render={(t1, t2) => (
					<React.Fragment>
						<ChoroplethMapController
							t1={t1}
							t2={t2}/>
					</React.Fragment>
				)}/>
			</div>

		</>
	)
		;
}

export default About;