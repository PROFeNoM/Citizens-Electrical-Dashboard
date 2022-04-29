import './IndicatorMenu.css';

import React from 'react';
import { Button, DatePicker, TreePicker } from 'rsuite';

import { IndicatorType, IndicatorClass } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import { zones } from 'geodata';

interface tree { label: string, value?: IndicatorType, children?: tree[] }

const indicatorTree: tree[] = [
	{
		label: 'Informations globales',
		value: IndicatorType.EnergyBalance,
	},
	{
		label: 'Consommation',
		children: [
			{
				label: 'Répartition selon le type de bâtiment',
				value: IndicatorType.ConsumptionDonut,
			},
			{
				label: 'Totale',
				value: IndicatorType.TotalConsumption,
			},
			{
				label: 'Journée type',
				value: IndicatorType.TypicalConsumptionDay,
			},
		],
	},
	{
		label: 'Production',
		children: [
			{
				label: 'Locale',
				value: IndicatorType.LocalProductionInfo,
			},
			{
				label: 'Répartion selon le type de bâtiment',
				value: IndicatorType.SolarDonut,
			},
			{
				label: 'Hebdomadaire',
				value: IndicatorType.WeeklyProduction,
			},
			{
				label: 'Journée type',
				value: IndicatorType.TypicalProductionDay,
			}
		],
	},
    {
        label: 'Stations de charge',
        value: IndicatorType.ChargingStations,
    },
];

const selectOptionsBuildings: { value: ConsumerProfile, label: string }[] = [
	{ value: ConsumerProfile.ALL, label: "Tous les bâtiments" },
	{ value: ConsumerProfile.RESIDENTIAL, label: "Résidentiels" },
	{ value: ConsumerProfile.TERTIARY, label: "Tertiaires" },
	{ value: ConsumerProfile.PROFESSIONAL, label: "Professionnels" },
	{ value: ConsumerProfile.PUBLIC_LIGHTING, label: "Eclairage publique" },
];

const selectOptionsZoneNames = zones.features.map((item) => ({ value: item.properties.libelle, label: item.properties.libelle }));
selectOptionsZoneNames.push({ value: 'Quartier de la Bastide', label: 'Quartier de la Bastide' });

interface Props {
    setZoneName: (val: string | null) => void;
    setIndicatorType: (val: IndicatorType) => void;
    setIndicatorClass: (val: IndicatorClass) => void;
    setBuildingType: (val: ConsumerProfile) => void;
    setT1: (val: Date) => void;
    setT2: (val: Date) => void;
    setHighlightedZone: (val: string | null) => void;
}

interface State {
    zoneName: string | null;
    indicatorType: IndicatorType;
    buildingType: ConsumerProfile;
    t1: Date;
    t2: Date;
}

/**
 * Indicator menu
 * 
 * Contains the buttons to select the indicator to display.
 */
export default class IndicatorMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        
        const today: Date = new Date();

        this.state = {
            zoneName: null,
            indicatorType: IndicatorType.EnergyBalance,
            buildingType: ConsumerProfile.ALL,
            t1: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30),
            t2: today
        };

        this.validateRequest = this.validateRequest.bind(this);
    }

    /**
    * Validate the indicator parameters and update the state.
    */
    validateRequest() {
        this.props.setHighlightedZone(null);

        if (this.state.zoneName === null || this.state.zoneName === "Quartier de la Bastide") {
            this.props.setZoneName(null);
        } else {
            this.props.setZoneName(this.state.zoneName);
        }

        this.props.setIndicatorType(this.state.indicatorType);
        this.props.setBuildingType(this.state.buildingType);
        this.props.setT1(this.state.t1);
        this.props.setT2(this.state.t2);

        switch (this.state.indicatorType) {
            case IndicatorType.ConsumptionDonut:
            case IndicatorType.TotalConsumption:
            case IndicatorType.TypicalConsumptionDay:
                this.props.setIndicatorClass(IndicatorClass.Consumption);
                break;
            case IndicatorType.LocalProductionInfo:
            case IndicatorType.SolarDonut:
            case IndicatorType.WeeklyProduction:
            case IndicatorType.TypicalProductionDay:
                this.props.setIndicatorClass(IndicatorClass.Production);
                break;
            case IndicatorType.EnergyBalance:
            default:
                this.props.setIndicatorClass(IndicatorClass.Global);
                break;
        }
    }

    render(): React.ReactNode {
        return (
            <div id="indicator-menu-wrapper">
                <TreePicker
                    onChange={(value: string) => { this.setState({ zoneName: value }); }}
                    className="indicator-menu tree-picker"
                    data={selectOptionsZoneNames}
                    placeholder="Zone"
                    placement="bottomEnd"
                />
                <TreePicker
                    onChange={(value: IndicatorType) => { this.setState({ indicatorType: value }); }}
                    className="indicator-menu tree-picker" data={indicatorTree}
                    placeholder="Indicateur"
                    placement="bottomEnd"
                />
                <TreePicker
                    onChange={(value: ConsumerProfile) => { this.setState({ buildingType: value }); }}
                    className="indicator-menu tree-picker"
                    data={selectOptionsBuildings}
                    placeholder="Filière"
                    placement="bottomEnd"
                />
                <DatePicker
                    className="indicator-menu date-picker"
                    onChange={(value) => { this.setState({ t1: value }); }}
                    placeholder="Date début"
                    defaultValue={this.state.t1}
                />
                <DatePicker
                    className="indicator-menu date-picker"
                    onChange={(value) => { this.setState({ t2: value }); }}
                    placeholder="Date fin"
                    defaultValue={this.state.t2}
                />
                <Button
                    className="indicator-menu validate-button"
                    onClick={this.validateRequest}>
                    OK
                </Button>
            </div>
        );
    }
}
