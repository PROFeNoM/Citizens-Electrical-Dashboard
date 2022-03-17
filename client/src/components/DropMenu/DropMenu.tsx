import "./DropMenu.css"
import React from "react";
import { DropMenuData, DropMenuData2 } from "./DropMenuData"
import {Link, useLocation} from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react"

function DropMenu() {
    const [dropmenu, setDropmenu] = useState(false)

    const showDropmenu = () => setDropmenu(!dropmenu)

    const [dropmenu2, setDropmenu2] = useState(false)

    const showDropmenu2 = () => setDropmenu2(!dropmenu2)

    const currentPage = useLocation().pathname.split('/')[1];
    const currentUrbanZone = useLocation().pathname.split('/')[2];

    return (
        <>
            <div>
                <div className='dropButton'>
                    <IoIosArrowDown onClick={showDropmenu} />
                </div>
                <nav className={dropmenu ? 'dropmenu active' : 'dropmenu'}>
                    <ul className='dropmenu-items' onClick={showDropmenu}>
                        {DropMenuData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={`${item.path}/${currentUrbanZone}`}>
                                        <span className='item-title'>{item.title}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
                <div className='dropButton2'>
                    <IoIosArrowDown onClick={showDropmenu2} />
                </div>
                <nav className={dropmenu2 ? 'dropmenu active' : 'dropmenu'}>
                    <ul className='dropmenu-items' onClick={showDropmenu2}>
                        {DropMenuData2.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={`/${currentPage}/${item.path}`}>
                                        <span className='item-title'>{item.title}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
}

export default DropMenu;