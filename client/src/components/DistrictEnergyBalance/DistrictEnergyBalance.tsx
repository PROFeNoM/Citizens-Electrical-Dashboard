import React from 'react';
import './DistrictEnergyBalance.css';
import {
	Building,
	getAllUrbanZonesName,
	getUrbanZoneArea,
	getUrbanZoneElectricityProduction,
	getUrbanZoneNumberOfBuildings,
	getUrbanZoneNumberOfSites,
	getZoneConsumption
} from '../../scripts/dbUtils';
import copy from 'fast-copy';

const formatter = new Intl.NumberFormat();

interface Data {
	nbOfBuildings: number,
	area: number,
	nbOfConsumers: number
	consumption?: number,
	production?: number,
}

interface Props {
	selectedZoneName: string,
	/** when the cancel btn is pressed (should unselect the currently selected zone) */
	onCancel: () => void,
}

interface State {
	districtData: Data,
	zonesData: { [name: string]: Data },
}

export default class DistrictEnergyBalance extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			districtData: {
				nbOfBuildings: 0,
				area: 0,
				nbOfConsumers: 0,
			},
			zonesData: {},
		};

		for (const zoneName of getAllUrbanZonesName()) {
			this.state.zonesData[zoneName] = {
				nbOfBuildings: getUrbanZoneNumberOfBuildings(zoneName),
				area: getUrbanZoneArea(zoneName),
				nbOfConsumers: getUrbanZoneNumberOfSites(zoneName, Building.Residential)
					+ getUrbanZoneNumberOfSites(zoneName, Building.Professional)
					+ getUrbanZoneNumberOfSites(zoneName, Building.Tertiary),
			};

			this.state.districtData.nbOfBuildings += this.state.zonesData[zoneName].nbOfBuildings;
			this.state.districtData.area += this.state.zonesData[zoneName].area;
			this.state.districtData.nbOfConsumers += this.state.zonesData[zoneName].nbOfConsumers;
		}
	}

	async componentDidMount() {
		const t1 = new Date('2021-12-01T00:30:00').getTime();
		const t2 = new Date('2021-12-31T23:30:00').getTime();

		let districtConsumption = 0;
		let districtProduction = 0;

		await Promise.all(getAllUrbanZonesName().map(async zoneName => {
			const [zoneConsumption, zoneProduction] = await Promise.all([
				getZoneConsumption(t1, Building.All, zoneName, t2),
				getUrbanZoneElectricityProduction(t1, zoneName, t2),
			]);

			this.setState(oldState => {
				const newState = copy(oldState);
				newState.zonesData[zoneName].consumption = zoneConsumption;
				newState.zonesData[zoneName].production = zoneProduction;
				return newState
			})

			districtConsumption += zoneConsumption;
			districtProduction += zoneProduction;
		}));

		this.setState(oldState => {
			const newState = copy(oldState);
			newState.districtData.consumption = districtConsumption;
			newState.districtData.production = districtProduction;
			return newState
		})
	}

	private get currentData(): Data {
		return this.props.selectedZoneName !== null
			? this.state.zonesData[this.props.selectedZoneName]
			: this.state.districtData;
	}

	render() {
		const data = this.currentData;
		const title = this.props.selectedZoneName ?? 'Quartier de la Bastide';
		const nbBuildings = formatter.format(data.nbOfBuildings);
		const area = formatter.format(Math.round(data.area));
		const nbOfConsumers = formatter.format(data.nbOfConsumers);
		const consumption = data.consumption !== undefined ? formatter.format(Math.round(data.consumption / 1_000_000)) : '...';
		const production = data.production !== undefined ? formatter.format(Math.round(data.production / 1_000_000)) : '...';
		const ratio = data.consumption !== undefined && data.production !== undefined ? formatter.format(Math.round(data.production / data.consumption * 100)) : '...';

		return (
			<div id="district-info-wrapper">
				<div id="district-info">
					<h2 id="district-name">{title}</h2>
					<ul>
						<li><span className="data">{nbBuildings}</span> bâtiments</li>
						<li><span className="data">{area}</span> m² de bâtiments</li>
						<li><span className="data">{nbOfConsumers}</span> consommateurs</li>
						<li><span className="data">{consumption}</span> MWh/mois d'électricité consommée</li>
						<li><span className="data">{production}</span> MWh/mois d'électricité produite</li>
						<li><span className="data">{ratio}</span> % de ratio production/consommation</li>
					</ul>
					{
						this.props.selectedZoneName === null ? (
							<div id="zone-hint">Cliquez sur une zone urbaine pour en savoir plus.</div>
						) : (
							<div id="controls">
								{/*<div onClick={this.props.onCancel}>retour</div>-->*/}
								<a href={'/consommation/' + this.props.selectedZoneName}>consommation</a>
								<a href={'/production/' + this.props.selectedZoneName}>production</a>
								<a href={'/bornes/' + this.props.selectedZoneName}>bornes de recharges</a>
							</div>
						)
					}
				</div>
			</div>
		);
	}
}
