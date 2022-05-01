import './IndicatorMenu.css';

import React from 'react';
import { Button, DatePicker, TreePicker } from 'rsuite';

import { Indicator, IndicatorType, IndicatorClass, getIndicatorFromType, getAllIndicators } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import { zonesGeoJSON } from 'geodata';

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

/**
 * Tree of indicators
 */
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

const selectOptionsBuildings: { value: ConsumerProfile, label: string }[] = [
    { value: ConsumerProfile.ALL, label: "Tous les bâtiments" },
    { value: ConsumerProfile.RESIDENTIAL, label: "Résidentiels" },
    { value: ConsumerProfile.TERTIARY, label: "Tertiaires" },
    { value: ConsumerProfile.PROFESSIONAL, label: "Professionnels" },
    { value: ConsumerProfile.PUBLIC_LIGHTING, label: "Éclairage publique" },
];

const selectOptionsZoneNames: { value: string, label: string }[] = zonesGeoJSON.features
    .map((item) => ({ value: item.properties.libelle, label: item.properties.libelle }));
selectOptionsZoneNames.push({ value: 'Quartier de la Bastide', label: 'Quartier de la Bastide' });

interface Props {
    setIndicator: (indicator: Indicator) => void;
    setZoneName: (zoneName: string | null) => void;
    setBuildingType: (buildingType: ConsumerProfile) => void;
    setT1: (t1: Date) => void;
    setT2: (t2: Date) => void;
    setHighlightedZone: (zoneName: string | null) => void;
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

        this.props.setIndicator(getIndicatorFromType(this.state.indicatorType));
        this.props.setBuildingType(this.state.buildingType);
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
                        data={selectOptionsZoneNames}
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
                        placement="bottomEnd"
                        defaultValue={IndicatorType.EnergyBalance}
                        cleanable={false}
                        defaultExpandAll={true}
                    />
                </div>
                <div id="indicator-menu-building-type">
                    <p>Filière de consommation</p>
                    <TreePicker
                        id="indicator-menu-building-type"
                        className="indicator-menu-item tree-picker"
                        onChange={(value: ConsumerProfile) => { this.setState({ buildingType: value }); }}
                        data={selectOptionsBuildings}
                        placeholder="Filière"
                        placement="bottomEnd"
                        defaultValue={ConsumerProfile.ALL}
                        cleanable={false}
                    />
                </div>
                <div id="indicator-menu-start-date">
                    <p>Date de début</p>
                    <DatePicker
                        id="indicator-menu-start-date"
                        className="indicator-menu-item date-picker"
                        onChange={(value) => { this.setState({ t1: value }); }}
                        placeholder="Date début"
                        defaultValue={this.state.t1}
                        cleanable={false}
                    />
                </div>
                <div id="indicator-menu-end-date">
                    <p>Date de fin</p>
                    <DatePicker
                        id="indicator-menu-end-date"
                        className="indicator-menu-item date-picker"
                        onChange={(value) => { this.setState({ t2: value }); }}
                        placeholder="Date fin"
                        defaultValue={this.state.t2}
                        cleanable={false}
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
