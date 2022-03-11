import { useEffect, useState } from 'react';
import './TotalConsumption.css';

export interface ChartOptions {
	title: {
	  text: string
	},
	data: Array<{				
			  type: string,
			  dataPoints: Array<{ 
				  x: number,  y: number  
				}>
			  
	 }>
 }

class TotalConsumptionModel {
	
	constructor(){
		
	}
}

export default TotalConsumptionModel;
