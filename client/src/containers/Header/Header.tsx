import './Header.css';
import logo from '../../images/logo.png';

interface HeaderProps {
	title: string;
}

function Header({ title }: HeaderProps) {
	return (
		<header>
				<p id="header-title">{title}</p>
				<img src={logo} id="logo" alt="Logo Enedis" color="#fff" />
		</header>
	);
}

export default Header;
