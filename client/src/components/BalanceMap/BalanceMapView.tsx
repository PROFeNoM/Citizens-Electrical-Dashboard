import './BalanceMap.css';
import React from "react";
import MapView from "../MapboxMap/MapboxMapView";

function BalanceMapView(props: { mapContainer: React.LegacyRef<HTMLDivElement> | undefined; }) {
	return (
		<div className='balance-map-wrapper'>
			
			<div id="BalanceMap" className="balance-map">
				<MapView mapContainer={props.mapContainer} />
			</div>
		</div>
	);
}

export default BalanceMapView;