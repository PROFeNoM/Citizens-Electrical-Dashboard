import './IndicatorMenu.css';

import React from 'react';
import { Button, DatePicker, TreePicker } from 'rsuite';

import {Indicator, IndicatorType, IndicatorClass, getIndicatorFromType, getAllIndicators } from 'constants/indicator';
import { ConsumerProfile } from 'scripts/api';
import { zones } from 'geodata';

/**
 * Type of a tree representing a menu with depth 1
 */
type tree<T> = {
    label: string,
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

const selectOptionsZoneNames = zones.features.map((item) => ({ value: item.properties.libelle, label: item.properties.libelle }));
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
                    defaultExpandAll={true}
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
