import './MapboxMap.css'
import React from 'react';

function MapView(props: { mapContainer: React.LegacyRef<HTMLDivElement> | undefined; }) {
	return (
		<div>
			<div ref={props.mapContainer} className='map-container' />
		</div>
	);
}

export default MapView;