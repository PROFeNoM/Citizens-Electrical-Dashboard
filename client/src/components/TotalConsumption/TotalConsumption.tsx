import React from 'react';
import './TotalConsumption.css';
import { CanvasJSChart } from 'canvasjs-react-charts';

interface ChartOptions {
	data: Array<{
		type: string,
		dataPoints: Array<{
			x: number, y: number
		}>

	}>
}

interface Props {}

const points1 = [
	{ x: 10, y: 71 },
	{ x: 20, y: 55 },
	{ x: 30, y: 50 },
	{ x: 40, y: 65 },
	{ x: 50, y: 71 },
	{ x: 60, y: 68 },
	{ x: 70, y: 38 },
	{ x: 80, y: 92 },
	{ x: 90, y: 50 },
	{ x: 100, y: 68 },
	{ x: 110, y: 27 },
	{ x: 120, y: 45 },
	{ x: 130, y: 44 }
];

const points2 = [
	{ x: 10, y: 71 },
	{ x: 20, y: 55 },
	{ x: 30, y: 50 },
	{ x: 40, y: 33 },
	{ x: 50, y: 71 },
	{ x: 60, y: 58 },
	{ x: 70, y: 48 },
	{ x: 80, y: 52 },
	{ x: 90, y: 54 },
	{ x: 100, y: 60 },
	{ x: 110, y: 61 },
	{ x: 120, y: 49 },
	{ x: 130, y: 26 }
];

class TotalConsumption extends React.Component<Props, {}> {

	private options: ChartOptions;

	constructor(props: Props) {
		super(props);

		this.options = {
			data: [{
				type: "area", //change type to bar, line, area, pie, etc
				dataPoints: points1

			}, {
				type: "line",
				dataPoints: points2

			}]
		}

	}


	render() {
		return (
			<div className="total-consumption-wrapper">
				<div className="total-consumption-title-wrapper">
					Consommation totale
				</div>

				<div id="TotalGraph" className="total-consumption">
					<CanvasJSChart options={this.options} />
				</div>
			</div>
		);
	}
}

export default TotalConsumption;
