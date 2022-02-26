import './ChoroplethMap.css'
import React from 'react';
import Map, {Layer, Source} from 'react-map-gl';
import {json_Decoupage_urbain} from "../../map/layers/Decoupage_urbain";
import {dataLayer} from './map-style';
import {FeatureCollection} from "geojson";
import {updateProperties} from "./utils";
import {Building, getUrbanZoneElectricityConsumption} from "../../scripts/dbUtils";

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';


interface ChoroplethMapState {
	data: FeatureCollection;
}

class ChoroplethMap extends React.Component<{}, ChoroplethMapState> {
	constructor(props: any) {
		super(props);
		this.state = {
			data: json_Decoupage_urbain as FeatureCollection
		};
	}

	componentDidMount() {
		const t1 = new Date('2021-12-01T00:30:00Z').getTime();
		const t2 = new Date('2021-12-31T23:30:00Z').getTime();
		(async () => {
			// @ts-ignore
			const data = await updateProperties(json_Decoupage_urbain, async f => getUrbanZoneElectricityConsumption(t1, Building.All, f.properties.libelle, t2));
			console.log(data);
			this.setState({
				data
			});
		})();
	}

	render() {
		return (
			<Map
				initialViewState={{
					latitude: 44.845615,
					longitude: -0.554897,
					zoom: 13.5,
				}}
				style={{width: 600, height: 400}}
				mapStyle="mapbox://styles/mapbox/streets-v9"
				mapboxAccessToken={MAPBOX_TOKEN}
			>
				<Source type='geojson' data={this.state.data}>
					<Layer {...dataLayer}/>
				</Source>
			</Map>
		);
	}
}

export default ChoroplethMap;
