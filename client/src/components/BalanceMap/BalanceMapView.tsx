import './BalanceMap.css';
import React from "react";
import BasicMapView from "../BasicMap/BasicMapView";

function BalanceMapView(props: { mapContainer: React.LegacyRef<HTMLDivElement> | undefined; }) {
	return (
		<div className='balance-map-wrapper'>
			
			<div id="BalanceMap" className="balance-map">
				<BasicMapView mapContainer={props.mapContainer} />
			</div>
		</div>
	);
}

export default BalanceMapView;