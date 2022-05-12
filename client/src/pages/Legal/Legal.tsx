import './Legal.css';
import { Header } from 'containers';



function Legal() {
	return (
		<>
			<header>
				<Header title={'Mentions légales'} />
			</header>
			<main>
				<div id="legal-text-wrapper">
					<h2>Propriété intellectuelle</h2>

					<p>
						Selon l'accord oral des clients, les sources du logiciel sont disponibles sous une licence open source au choix de l'équipe de développement. L'ensemble des sources du logiciel est donc licencié sous la <a href="https://www.gnu.org/licenses/gpl-3.0.fr.html" target={'blank'}>GNU General Public License 3</a>.
					</p>
				</div>
			</main>
		</>
	);
}

export default Legal;
