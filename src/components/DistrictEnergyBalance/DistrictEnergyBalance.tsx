import React, {useEffect, useState} from 'react';
import './DistrictEnergyBalance.css';
import {
    Building,
    getDistrictArea,
    getDistrictElectricityConsumption,
    getDistrictNumberOfBuildings
} from "../../scripts/dbUtils";

function DistrictEnergyBalance() {
    const [nbBuilding, setNbBuilding] = useState(0);
    const [area, setArea] = useState("");
    const [elecCons, setElecCons] = useState("");

    useEffect(() => {
        (async () => {
            const rNbBuilding = getDistrictNumberOfBuildings(Building.Residential)
                + getDistrictNumberOfBuildings(Building.Professional)
                + getDistrictNumberOfBuildings(Building.Tertiary);

            const rArea = new Intl.NumberFormat().format(Math.round(await getDistrictArea()));
            const rElecCons = new Intl.NumberFormat().format(Math.round(await getDistrictElectricityConsumption('2021-12-01 00:30:00+02:00', Building.All, '2021-12-31 23:30:00+02:00')));

            setNbBuilding(rNbBuilding);
            setArea(rArea);
            setElecCons(rElecCons)
        })();
    }, []);

    return (
        <>
            <span className='district-info'>{nbBuilding} bâtiments</span>
            <span className='district-info'>{area} m2</span>
            <span className='district-info'>{elecCons} conso</span>
        </>
    );
}

export default DistrictEnergyBalance;