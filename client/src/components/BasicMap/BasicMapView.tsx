import './BasicMap.css'
import React from 'react';

function BasicMapView(props: { mapContainer: React.LegacyRef<HTMLDivElement> | undefined; }) {
	return (
		<div>
			<div ref={props.mapContainer} className='map-container' />
		</div>
	);
}

export default BasicMapView;