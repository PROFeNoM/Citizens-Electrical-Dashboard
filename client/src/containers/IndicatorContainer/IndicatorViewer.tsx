import './IndicatorViewer.css';

import React from 'react';

import { Indicator, IndicatorType } from 'constants/indicators';
import { ConsumerProfile } from 'constants/profiles';
import {
    GlobalInfo,
    ConsumptionInfo, ConsumptionDonut, ProfileConsumption, WeeklyConsumption, TypicalConsumptionDay,
    ProductionInfo, TypicalProductionDay, ProductionDonut, WeeklyProduction,
    ChargingStations
} from 'components/Indicators';

interface Props {
    indicator: Indicator; // Selected indicator
    zoneName: string | null; // Name of the selected zone
    consumerProfile: ConsumerProfile; // Selected consumer profile
    t1: Date; // Start time of the current period (Unix milliseconds)
    t2: Date; // End time of the current period (Unix milliseconds)
    setHighlightedZone: (val: string | null) => void; // Function to set the highlighted zone
}

/**
 * Component that contains the the logic to switch between
 * the different indicator and give them the proper parameters.
 * 
 * @see IndicatorContainer
 * @see IndicatorMenu
 */
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
    private renderIndicator(indicator: Indicator): JSX.Element {
        const { zoneName, consumerProfile, t1, t2, setHighlightedZone } = this.props;

        switch (indicator.type) {
            case IndicatorType.ConsumptionInfo:
                return (
                <ConsumptionInfo
                zoneName={zoneName}
                consumerProfile={consumerProfile}
                t1={t1.getTime()}
                t2={t2.getTime()}
                />)
                ;
            case IndicatorType.ProfileConsumption:
                return (
                    <ProfileConsumption
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.ConsumptionDonut:
                return (
                    <ConsumptionDonut
                        zoneName={zoneName}
                        buildingType={consumerProfile}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.WeeklyConsumption:
                return (
                    <WeeklyConsumption
                        zoneName={zoneName}
                        consumerProfile={consumerProfile}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.TypicalConsumptionDay:
                return (
                    <TypicalConsumptionDay
                        zoneName={zoneName}
                        consumerProfile={consumerProfile}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.ProductionInfo:
                return (
                    <ProductionInfo
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.TypicalProductionDay:
                return (
                    <TypicalProductionDay
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.ProductionDonut:
                return (
                    <ProductionDonut
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                        setHighlightedZone={setHighlightedZone}
                    />
                );
            case IndicatorType.WeeklyProduction:
                return (
                    <WeeklyProduction
                        zoneName={zoneName}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
            case IndicatorType.ChargingStations:
                return (
                    <ChargingStations
                        zoneName={zoneName}
                    />
                );
            case IndicatorType.GlobalInfo:
            default:
                return (
                    <GlobalInfo
                        zoneName={zoneName}
                        consumerProfile={consumerProfile}
                        t1={t1.getTime()}
                        t2={t2.getTime()}
                    />
                );
        }
    }

    render() {
        const { indicator, zoneName, consumerProfile, t1, t2 } = this.props;

        return (
            <div id="indicator-viewer">
                <div id="indicator-name-wrapper">
                    <p>{indicator.name}</p>
                </div>
                <div id="indicator-content" key={indicator + zoneName + consumerProfile + t1 + t2}>
                    {this.renderIndicator(indicator)}
                </div>
            </div>
        );
    }
}
