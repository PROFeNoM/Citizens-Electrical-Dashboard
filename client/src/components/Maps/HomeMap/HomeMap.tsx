import React from 'react';
import UrbanZoneMap from '../UrbanZonesMap/UrbanZoneMap';

interface Props {
	/** Triggered on a click on the map. If the click is performed outside a zone, zoneName is null. */
	// onZoneClick: (zoneName: string | null) => void,
}

interface State {
	zone: string | number | null,
}

export default class HomeMap extends React.Component<Props, State> {
	private mapRef = React.createRef<UrbanZoneMap>();

	constructor(props) {
		super(props);
		this.state = {
			zone: null,
		};
	}

	unselectZone() {
		// simulate a click outside all zones
		this.onZoneClick(null, null)
	}

	get map() {
		return this.mapRef.current.map;
	}

	private onZoneClick(featureId: string | number | null, zoneName: string | null) {
		if (this.state.zone === featureId) {
			return;
		}

		// deselect current zone
		if (this.state.zone !== null) {
			this.map.setFeatureState(
				{ source: 'urbanZone-source', id: this.state.zone },
				{ selected: false },
			);
		}

		// select the new one
		if (zoneName !== null) {
			this.map.setFeatureState(
				{ source: 'urbanZone-source', id: featureId },
				{ selected: true },
			);
		}

		// update state
		this.setState({
			zone: featureId,
		})

		// trigger event
		// this.props.onZoneClick(zoneName);
	}

	render() {
		return (
			<UrbanZoneMap
				ref={this.mapRef}
				center={[-0.5564, 44.8431]}
				bounds={[
					[-0.5463, 44.8522],
					[-0.5665, 44.8382],
				]}
				zoom={15.5}
				pitch={42}
				zonesFillColor={[
					'case',
					['boolean', ['feature-state', 'selected'], false],
					'#005eb8',
					'#7fd1ef',
				]}
				// onZoneClick={() => undefined}//{(featureId, zoneName) => this.onZoneClick(featureId, zoneName)}
			/>
		);
	}
}
