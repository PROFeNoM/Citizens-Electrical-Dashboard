import './HamburgerButton.css';

export function HamburgerButton ({ open, setOpen }) {
    return (
        <div className={open ? "hamburger-button active" : "hamburger-button"} onClick={() => setOpen(!open)}>
            <div />
            <div />
            <div />
        </div>
    )
}
