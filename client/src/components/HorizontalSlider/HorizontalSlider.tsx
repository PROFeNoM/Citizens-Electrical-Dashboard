import './HorizontalSlider.css';
import React, { ReactElement } from 'react';
import { Box, Slider } from '@mui/material';

const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"]

const steps = ["Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Decembre"]

const marks = steps.map((month, index) => {
	return {
		value: Math.round(index / (steps.length - 1) * 100),
		label: month,
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

interface Props {
	children: (t1: number, t2: number) => ReactElement,
}

interface State {
	month: string,
	t1: number,
	t2: number,
}

export default class HorizontalSlider extends React.Component<Props, State> {
	constructor(props) {
		super(props);
		this.state = {
			month: 'Decembre',
			t1: new Date('2021-12-01T00:30:00Z').getTime(),
			t2: new Date('2021-12-31T23:30:00Z').getTime()
		};

		this.onChange = this.onChange.bind(this);
	}

	private onChange(_event: Event, newValue: number) {
		const month = valueToMonth(newValue, marks);
		const [t1, t2] = getMonthTimestampsBounds(this.state.month);
		this.setState({ month, t1, t2 });
	}

	render() {
		return (
			<div className='slider-bounded-content-wrapper'>
				<div className='horizontal-slider-wrapper'>
					<div className='slider-content-wrapper'>
						<div className='box-slider-wrapper'>
							<Box width='100%'>
								<Slider
									aria-label="Restricted values"
									defaultValue={100}
									step={null}
									valueLabelDisplay="off"
									marks={marks}
									onChange={this.onChange}
									size='small'
									track={false}
								/>
							</Box>
						</div>
					</div>
				</div>
				<div className='slider-bounded-content' key={this.state.t1}>
					{this.props.children(this.state.t1, this.state.t2)}
				</div>
			</div>
		)
	}
}
