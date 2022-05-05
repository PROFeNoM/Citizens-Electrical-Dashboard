import './IndicatorViewer.css';

import React from 'react';

import { Indicator, IndicatorType } from 'constants/indicator';
import { ConsumerProfile } from 'constants/profiles';
import {
    EnergyBalance,
    TypicalConsumptionDay, ConsumptionDonut, TotalConsumption,
    LocalProductionInfo, TypicalProductionDay, SolarDonut, WeeklyProduction,
    ChargingStations
} from 'components/Indicators';

interface Props {
    indicator: Indicator;
    zoneName: string | null;
    sector: ConsumerProfile;
    t1: Date;
    t2: Date;
    setHighlightedZone: (val: string | null) => void;
}

export default class IndicatorViewer extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);

        this.renderIndicator = this.renderIndicator.bind(this);
    }

    /**
     * Return the component corresponding to the indicator given.
     * 
     * @param indicator The indicator to render
     * @returns The component corresponding to the given indicator
     */
    private renderIndicator(indicator: Indicator) {
        const { zoneName, sector, t1, t2, setHighlightedZone } = this.props;

        switch (indicator.type) {
            case IndicatorType.TypicalConsumptionDay:
                return (
                    <TypicalConsumptionDay
                        urbanZone={zoneName}
                        buildingType={sector}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.TotalConsumption:
                return (
                    <TotalConsumption
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        urbanZone={zoneName}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.ConsumptionDonut:
                return (
                    <ConsumptionDonut
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        urbanZone={zoneName}
                        buildingType={sector}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.LocalProductionInfo:
                return (
                    <LocalProductionInfo
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        urbanZone={zoneName}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.SolarDonut:
                return (
                    <SolarDonut
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        urbanZone={zoneName}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.WeeklyProduction:
                return (
                    <WeeklyProduction
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        urbanZone={zoneName}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.ChargingStations:
                return (
                    <ChargingStations
                        zoneName={zoneName}
                    />
                );
            case IndicatorType.EnergyBalance:
            default:
                return (
                    <EnergyBalance
                        zoneName={zoneName}
                        sector={sector}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
        }
    }

    render() {
        const { indicator, zoneName, sector, t1, t2 } = this.props;

        return (
            <div id="indicator-viewer">
                <div id="indicator-name-wrapper">
                    <p>{indicator.name}</p>
                </div>
                <div id="indicator-content" key={indicator+zoneName+sector+t1+t2}>
                    {this.renderIndicator(indicator)}
                </div>
            </div>
        );
    }
}
