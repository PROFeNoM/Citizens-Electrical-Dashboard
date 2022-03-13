import './ChoroplethMap.css';
import React from "react";
import BasicMapView from "../BasicMap/BasicMapView";

function ChoroplethMapView(props: { mapContainer: React.LegacyRef<HTMLDivElement> | undefined; }) {
	return (
		<div className='choropleth-map-wrapper'>
			<div className='choropleth-map-title-wrapper'>
				Comparaison du taux de consommation entre chaque zone urbaine du quartier
			</div>

			<div id="urbanZoneComparisonMap" className="choropleth-map">
				<BasicMapView mapContainer={props.mapContainer} />
			</div>

			<div className='color-wrapper'>
				<div className='high-end-color-wrapper'>
					<div className='high-end-color'/>
					<p className='high-end-text'>Forte consommation</p>
				</div>
				<div className='low-end-color-wrapper'>
					<div className='low-end-color'/>
					<p className='low-end-text'>Faible consommation</p>
				</div>
			</div>
		</div>
	);
}

export default ChoroplethMapView;