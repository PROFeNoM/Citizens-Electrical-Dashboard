import './Home.css';
import React from 'react';
import { Header } from 'components';
import { Indicator, IndicatorClass, indicatorTree, selectOptionsBuildings, selectOptionsZoneNames } from './HomeUtils';
import { MapContainer, IndicatorContainer } from 'containers';
import { ConsumerProfile } from 'scripts/api';
import { Button, DatePicker, TreePicker } from 'rsuite';

interface State {
    selectedZoneName: string | null,
    indicatorType: Indicator,
    indicatorClass: IndicatorClass,
    buildingType: ConsumerProfile,
    t1: Date,
    t2: Date,
    highlightedZoneName: string | null,
}

export default class Home extends React.Component<{}, State>{

    private temporaryState: State;

    constructor(props: {}) {
        super(props);
        this.state = {
            selectedZoneName: null,
            indicatorType: Indicator.DistrictEnergyBalance,
            indicatorClass: IndicatorClass.Global,
            buildingType: ConsumerProfile.ALL,
            t1: new Date('2021-12-01T00:30:00Z'),
            t2: new Date('2021-12-31T00:30:00Z'),
            highlightedZoneName: null,
        };
        this.temporaryState = this.state;
        this.validateRequest = this.validateRequest.bind(this);
    }

    validateRequest() {
        this.setState({ highlightedZoneName: null });

        if (this.temporaryState.selectedZoneName === "Quartier de la Bastide") {
            this.setState({ selectedZoneName: null });
        } else {
            this.setState({ selectedZoneName: this.temporaryState.selectedZoneName });
        }

        this.setState({ indicatorType: this.temporaryState.indicatorType });
        this.setState({ buildingType: this.temporaryState.buildingType });
        this.setState({ t1: this.temporaryState.t1 });
        this.setState({ t2: this.temporaryState.t2 });

        switch (this.temporaryState.indicatorType) {
            case Indicator.DistrictEnergyBalance:
                this.setState({ indicatorClass: IndicatorClass.Global });
                break;
            case Indicator.ConsumptionDonut:
            case Indicator.TotalConsumption:
            case Indicator.TypicalConsumptionDay:
                this.setState({ indicatorClass: IndicatorClass.Consumption });
                break;
            case Indicator.LocalProductionInfo:
            case Indicator.SolarDonut:
            case Indicator.WeeklyProduction:
            case Indicator.TypicalProductionDay:
                this.setState({ indicatorClass: IndicatorClass.Production });
                break;
            default:
                this.setState({ indicatorClass: IndicatorClass.Global });
                break;
        }
    }

    handler = (val: string | null) => {
        this.setState({ highlightedZoneName: val });
    }

    render() {
        return (
            <div id="home-container">
                <Header title='Tableau éléctrique citoyen' />
                <main>
                    <div id="map-container">
                        <MapContainer
                            t1={this.state.t1}
                            t2={this.state.t2}
                            indicatorClass={this.state.indicatorClass}
                            highlightedZoneName={this.state.highlightedZoneName}
                        />
                    </div>
                    <div id="indicators-container">
                        <div id="indicators-menus-wrapper">
                            <TreePicker
                                onChange={(values: string) => { this.temporaryState.selectedZoneName = values }}
                                className="indicators-menu tree-picker"
                                data={selectOptionsZoneNames}
                                placeholder="Zone"
                                placement="bottomEnd"
                            />
                            <TreePicker
                                onChange={(values: Indicator) => this.temporaryState.indicatorType = values}
                                className="indicators-menu tree-picker" data={indicatorTree}
                                placeholder="Indicateur"
                                placement="bottomEnd"
                            />
                            <TreePicker
                                onChange={(values: ConsumerProfile) => { this.temporaryState.buildingType = values }}
                                className="indicators-menu tree-picker"
                                data={selectOptionsBuildings}
                                placeholder="Filière"
                                placement="bottomEnd"
                            />
                            <DatePicker
                                className="indicators-menu date-picker"
                                onChange={(value) => this.temporaryState.t1 = value}
                                placeholder="Date début"
                                defaultValue={this.state.t1}
                            />
                            <DatePicker
                                className="indicators-menu date-picker"
                                onChange={(value) => this.temporaryState.t2 = value}
                                placeholder="Date fin"
                                defaultValue={this.state.t2}
                            />
                            <Button
                                className="indicators-menu validate-button"
                                onClick={this.validateRequest}>
                                OK
                            </Button>
                        </div>
                        <div id="indicators-wrapper"
                            key={this.state.selectedZoneName
                                + this.state.t1.toString()
                                + this.state.t2.toString()
                                + this.state.buildingType}
                        >
                            <IndicatorContainer
                                selectedZoneName={this.state.selectedZoneName}
                                indicatorType={this.state.indicatorType}
                                buildingType={this.state.buildingType}
                                t1={this.state.t1}
                                t2={this.state.t2}
                                setHighlightedZone={this.handler}
                            />
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}
