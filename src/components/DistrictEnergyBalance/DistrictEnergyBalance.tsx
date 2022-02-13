import React, {useEffect, useState} from 'react';
import './DistrictEnergyBalance.css';
import {Building, getDistrictArea, getDistrictNumberOfBuildings} from "../../scripts/dbUtils";

function DistrictEnergyBalance() {
    const [nbBuilding, setNbBuilding] = useState(0);
    const [area, setArea] = useState("");
    useEffect(() => {
        (async () => {
            const rNbBuilding = getDistrictNumberOfBuildings(Building.Residential)
                + getDistrictNumberOfBuildings(Building.Professional)
                + getDistrictNumberOfBuildings(Building.Tertiary);

            const rArea = new Intl.NumberFormat().format(Math.round(await getDistrictArea()));

            setNbBuilding(rNbBuilding);
            setArea(rArea);
        })();
    }, []);

    return (
        <>
            <span className='district-info'>{nbBuilding} bâtiments</span>
            <span className='district-info'>{area} m2</span>
        </>
    );
}

export default DistrictEnergyBalance;