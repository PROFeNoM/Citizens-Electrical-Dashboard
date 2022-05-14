import './IndicatorMenu.css';

import React from 'react';
import { Button, DatePicker, TreePicker } from 'rsuite';

import { Indicator, IndicatorType, IndicatorClass, getIndicatorFromType, getAllIndicators } from 'constants/indicators';
import { ConsumerProfile } from 'constants/profiles';
import { getZonesGeoJSON } from 'geodata';

/**
 * Type of a tree representing a menu with depth 1
 */
type tree<T> = {
	label: string,
	value: string,
	children: {
		label: string,
		value: T
	}[]
}[];

// Tree of all the indicators
const indicatorTree: tree<IndicatorType> = Object.values(IndicatorClass)
	.map((className: string) => (
		{
			label: className,
			value: className,
			children:
				getAllIndicators()
					.filter((indicator: Indicator) => indicator.class === className)
					.map((indicator: Indicator) => (
						{
							label: indicator.name,
							value: indicator.type
						}
					))
		}
	));

// List of all consumer profiles
const consumerProfiles: { value: ConsumerProfile, label: string }[] = [
	{ value: ConsumerProfile.ALL, label: "Tous les bâtiments" },
	{ value: ConsumerProfile.RESIDENTIAL, label: "Résidentiels" },
	{ value: ConsumerProfile.TERTIARY, label: "Tertiaires" },
	{ value: ConsumerProfile.PROFESSIONAL, label: "Professionnels" },
	{ value: ConsumerProfile.PUBLIC_LIGHTING, label: "Éclairage publique" },
];

interface Props {
	indicator: Indicator; // Selected indicator
	setIndicator: (indicator: Indicator) => void; // Function to set the selected indicator
	zoneName: string | null; // Name of the selected zone
	setZoneName: (zoneName: string | null) => void; // Function to set the selected zone
	consumerProfile: ConsumerProfile; // Selected consumer profile
	setConsumerProfile: (consumerProfile: ConsumerProfile) => void; // Function to set the selected consumer profile
	t1: Date; // Start time of the current period (Unix milliseconds)
	setT1: (t1: Date) => void; // Function to set the start time of the current period
	t2: Date; // End time of the current period (Unix milliseconds)
	setT2: (t2: Date) => void; // Function to set the end time of the current period
	setHighlightedZone: (zoneName: string | null) => void; // Function to set the highlighted zone
}

interface State {
	zoneNames: { value: string, label: string }[]; // List of the zones
	zoneName: string | null; // Name of the selected zone
	indicatorType: IndicatorType; // Selected indicator type
	consumerProfile: ConsumerProfile; // Selected consumer profile
	t1: Date; // Start time of the current period (Unix milliseconds)
	t2: Date; // End time of the current period (Unix milliseconds)
}

/**
 * Component that contains the buttons to select the different parameters of the application.
 * Parameters:
 * - name of the zone
 * - indicator
 * - consumer profile
 * - time period
 * 
 * @see IndicatorContainer
 * @see IndicatorViewer
 */
export default class IndicatorMenu extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			zoneNames: [],
			zoneName: this.props.zoneName,
			indicatorType: this.props.indicator.type,
			consumerProfile: this.props.consumerProfile,
			t1: this.props.t1,
			t2: this.props.t2
		};

		this.validateRequest = this.validateRequest.bind(this);
	}

	async componentDidMount() {
		function capitalize(str: string): string {
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		const zoneNames = (await getZonesGeoJSON()).features
			.map((item) => ({ value: item.properties.libelle, label: capitalize(item.properties.libelle) }));
		zoneNames.push({ value: 'Quartier de la Bastide', label: 'Quartier de la Bastide' });
		this.setState({ zoneNames });
	}

	/**
	* Validate the indicator parameters and update the state.
	*/
	validateRequest() {
		if (this.state.zoneName === null || this.state.zoneName === "Quartier de la Bastide") {
			this.props.setZoneName(null);
			this.props.setHighlightedZone(null);
		} else {
			this.props.setZoneName(this.state.zoneName);
			this.props.setHighlightedZone(this.state.zoneName);
		}

		this.props.setIndicator(getIndicatorFromType(this.state.indicatorType));
		this.props.setConsumerProfile(this.state.consumerProfile);
		this.props.setT1(this.state.t1);
		this.props.setT2(this.state.t2);
	}

	render(): React.ReactNode {
		return (
			<div id="indicator-menu">
				<div id="indicator-menu-zone">
					<p>Zone géographique</p>
					<TreePicker
						className="indicator-menu-item tree-picker"
						onChange={(value: string) => { this.setState({ zoneName: value }); }}
						data={this.state.zoneNames}
						placeholder="Zone"
						placement="bottomEnd"
						defaultValue={'Quartier de la Bastide'}
						cleanable={false}
					/>
				</div>
				<div id="indicator-menu-indicator-type">
					<p>Type d'indicateur</p>
					<TreePicker
						className="indicator-menu-item tree-picker" data={indicatorTree}
						onChange={(value: IndicatorType | IndicatorClass) => { if (typeof value === 'number') { this.setState({ indicatorType: value }); } }}
						placeholder="Indicateur"
						placement="bottomStart"
						defaultValue={IndicatorType.GlobalInfo}
						cleanable={false}
						defaultExpandAll={true}
					/>
				</div>
				<div id="indicator-menu-building-type">
					<p><span className="full-text">Filière de consommation</span><span className="small-text">Filière de conso.</span></p>
					<TreePicker
						className="indicator-menu-item tree-picker"
						onChange={(value: ConsumerProfile) => { this.setState({ consumerProfile: value }); }}
						data={consumerProfiles}
						placeholder="Filière"
						placement="bottomEnd"
						defaultValue={ConsumerProfile.ALL}
						cleanable={false}
					/>
				</div>
				<div id="indicator-menu-start-date">
					<p>Date de début</p>
					<DatePicker
						className="indicator-menu-item date-picker"
						onChange={(value) => { this.setState({ t1: value }); }}
						placeholder="Date début"
						placement="bottomStart"
						defaultValue={this.state.t1}
						cleanable={false}
						format={'dd/MM/yyyy'}
					/>
				</div>
				<div id="indicator-menu-end-date">
					<p>Date de fin</p>
					<DatePicker
						className="indicator-menu-item date-picker"
						onChange={(value) => { this.setState({ t2: value }); }}
						placeholder="Date fin"
						placement="bottomEnd"
						defaultValue={this.state.t2}
						cleanable={false}
						format={'dd/MM/yyyy'}
					/>
				</div>
				<div id="indicator-menu-validate">
					<Button
						className="indicator-menu-item validate-button"
						onClick={this.validateRequest}>
						Voir →
					</Button>
				</div>
			</div>
		);
	}
}
