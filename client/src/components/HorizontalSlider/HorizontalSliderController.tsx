import React from 'react';
import HorizontalSliderView from "./HorizontalSliderView";

const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"]

const steps = ["Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"]

const marks = steps.map((month, index) => {
	return {
		value: Math.round(index / (steps.length - 1) * 100),
		label: month
	};
})

function getMonthTimestampsBounds(month: string): [number, number] {
	const monthIdx = ('0' + (months.findIndex(value => value === month) + 1)).slice(-2);
	const t1 = new Date(`2021-${monthIdx}-01T00:30:00Z`).getTime();
	const t2 = new Date(`2021-${monthIdx}-31T23:30:00Z`).getTime();
	return [t1, t2]
}

function valueToMonth(value: number, marks: { label: string, value: number }[]) {
	return marks.find((el) => el.value === value).label;
}

class HorizontalSliderController extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			defaultValue: 100,
			month: 'Decembre',
			marks: marks,
			t1: new Date('2021-12-01T00:30:00Z').getTime(),
			t2: new Date('2021-12-31T23:30:00Z').getTime()
		};

		this.handleOnChangeCommitted = this.handleOnChangeCommitted.bind(this);
	}

	handleOnChangeCommitted(event: Event, newValue: number) {
		this.setState({
			month: valueToMonth(newValue, marks)
		});
		const [_t1, _t2] = getMonthTimestampsBounds(this.state.month);
		console.log("[DEBUG]: displaying " + this.state.month)
		this.setState({
			t1: _t1,
			t2: _t2
		});
	}

	render() {
		return (
			<div className='slider-bounded-content-wrapper'>
				<div className='horizontal-slider-wrapper'>
					<HorizontalSliderView
						marks={this.state.marks}
						handleChangeCommitted={this.handleOnChangeCommitted}
						defaultValue={this.state.defaultValue}/>
				</div>
				<div className='slider-bounded-content' key={this.state.t1}>
					{this.props.render(this.state.t1, this.state.t2)}
				</div>
			</div>
		)
	}
}

export default HorizontalSliderController;