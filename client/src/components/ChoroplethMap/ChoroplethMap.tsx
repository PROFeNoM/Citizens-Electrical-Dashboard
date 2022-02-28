import './ChoroplethMap.css'
import React from 'react';
import {json_Decoupage_urbain} from "../../map/layers/Decoupage_urbain";
import {json_Batiment_Bordeaux_Bastide_TEC} from "../../map/layers/Batiment_Bordeaux_Bastide_TEC"
import {buildings3D, dataLayer, polyStyle} from './map-style';
import {FeatureCollection} from "geojson";
import {updateProperties} from "./utils";
import {Building, getUrbanZoneElectricityConsumption} from "../../scripts/dbUtils";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = 'pk.eyJ1IjoicHJvZmVub20iLCJhIjoiY2wwNDR3NnNoMGE2NTNpb2dxazg4NW1tdCJ9.hCeP49duNV1x-13qb2aMtA';


interface ChoroplethMapState {
	latitude: number;
	longitude: number;
	zoom: number;
	data: FeatureCollection;
	buildingData: FeatureCollection;
}

class ChoroplethMap extends React.PureComponent<{}, ChoroplethMapState> {
	private readonly mapContainer: React.RefObject<any>;

	constructor(props: any) {
		super(props);
		this.state = {
			latitude: 44.845615,
			longitude: -0.554897,
			zoom: 13.5,
			data: json_Decoupage_urbain as FeatureCollection,
			buildingData: json_Batiment_Bordeaux_Bastide_TEC as FeatureCollection
		};
		this.mapContainer = React.createRef();
	}

	componentDidMount() {
		const t1 = new Date('2021-12-01T00:30:00Z').getTime();
		const t2 = new Date('2021-12-31T23:30:00Z').getTime();
		(async () => {
			// @ts-ignore
			await updateProperties(json_Decoupage_urbain, async f => getUrbanZoneElectricityConsumption(t1, Building.All, f.properties.libelle, t2))
				.then(data => {
					this.setState({
						data
					});
				})
				.then(() => {
					let map = new mapboxgl.Map({
						container: this.mapContainer.current,
						style: "mapbox://styles/mapbox/streets-v9",
						center: [this.state.longitude, this.state.latitude],
						zoom: this.state.zoom,
						accessToken: MAPBOX_TOKEN
					});

					map.on('load', () => {
						let hoveredStateId: any = null;

						map.addSource('urbanZone-source', {
							'type': 'geojson',
							'data': this.state.data,
							'generateId': true
						});
						map.addSource('district-buildings', {
							'type': 'geojson',
							'data': this.state.buildingData,
							'generateId': true
						});
						map.addLayer(dataLayer);
						map.addLayer(polyStyle);
						map.addLayer(buildings3D);

						map.on('mousemove', 'data', (e) => {
							// @ts-ignore
							if (e.features.length > 0) {
								if (hoveredStateId !== null) {
									map.setFeatureState(
										{source: 'urbanZone-source', id: hoveredStateId},
										{hover: false}
									);
								}
								// @ts-ignore
								hoveredStateId = e.features[0].id;
								map.setFeatureState(
									{source: 'urbanZone-source', id: hoveredStateId},
									{hover: true}
								);
							}
						});

						map.on('mouseleave', 'data', () => {
							if (hoveredStateId !== null) {
								map.setFeatureState(
									{source: 'urbanZone-source', id: hoveredStateId},
									{hover: false}
								);
							}
							hoveredStateId = null;
						});
					});
				});
		})();
	}

	render() {
		return (
			<div className='choropleth-map-wrapper'>
				<div className='choropleth-map-title-wrapper'>
					Comparaison du taux de consommation entre chaque zone urbaine du quartier
				</div>
				<div id="urbanZoneComparisonMap" className="choropleth-map">
					<div style={{height: "100%", width: "100%"}} ref={this.mapContainer}/>
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
}

export default ChoroplethMap;
