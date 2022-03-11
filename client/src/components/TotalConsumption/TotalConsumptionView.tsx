import { useEffect, useState } from 'react';
import './TotalConsumption.css';
import {CanvasJSChart} from 'canvasjs-react-charts';
import { ChartOptions } from './TotalConsumptionModel';
 
function TotalConsumptionView(props: { Options: ChartOptions; }) {
	

	return (
		<div className='total-consumption-wrapper'>
			<div className='total-consumption-title-wrapper'>
				Consommation totale
			</div>

			<div id="TotalGraph" className="total-consumption">
				<CanvasJSChart options={props.Options}/> 
			</div>
		</div>
	);
}

export default TotalConsumptionView;
