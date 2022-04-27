import './HamburgerMenu.css';
import React, { useState } from 'react';
import { HamburgerMenu } from "./HamburgerMenu";
import { HamburgerButton } from "./HamburgerButton";

function Hamburger() {
    const [open, setOpen] = useState(false);
    const node = React.useRef();
    return (
        <div id="hamburger" ref={node}>
            <HamburgerButton open={open} setOpen={setOpen} />
            <HamburgerMenu open={open} />
        </div>
    )
}

export default Hamburger;