import './HorizontalSlider.css';
import React from "react";
import {Box, Slider} from "@mui/material";

function HorizontalSliderView(props: {
	marks: {value: number, label: string}[],
	handleChangeCommitted: (event: React.SyntheticEvent | Event, value: number | number[]) => void,
	defaultValue: number
}) {
	return (
		<div className='slider-content-wrapper'>
			<div className='box-slider-wrapper'>
				<Box
					width='100%'
				>
					<Slider
						aria-label="Restricted values"
						defaultValue={props.defaultValue}
						step={null}
						valueLabelDisplay="off"
						marks={props.marks}
						onChangeCommitted={props.handleChangeCommitted}
						size='small'
						track={false}
					/>
				</Box>
			</div>
		</div>
	);
}

export default HorizontalSliderView;