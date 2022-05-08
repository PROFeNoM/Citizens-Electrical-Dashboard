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
					<h2>Propriété intelectuelle</h2>

					<p>
						Selon l'accord oral des clients, les sources du logiciel sont disponibles sous une licence open source au choix de l'équipe de développement. L'ensemble des sources du logiciel est donc licencié sous la <a href="https://www.gnu.org/licenses/gpl-3.0.fr.html" target={'blank'}>GNU General Public License 3</a>.
					</p>

					<h2>Parties prenantes</h2>

					<h3>Encadrant</h3>

					<ul>
						<li>Herbreteau Frédéric (enseignant chercheur — ENSEIRB-MATMECA)</li>
					</ul>

					<h3>Clients</h3>

					<ul>
						<li>Demay Henry-Pierre (relation collectivités — Enedis)</li>
						<li>Marty Olivier (responsable pôle PMIS — URISA/IESF Nouvelle-Aquitaine)</li>
						<li>Mollard Yoan (ingénieur de recherche en robotique — ENSEIRB-MATMECA)</li>
					</ul>

					<h3>Équipe de développement</h3>
					<ul>
						<li>Agtaib Badre Iddine (élève — ENSEIRB-MATMECA)</li>
						<li>Boitel Faustin (élève — ENSEIRB-MATMECA)</li>
						<li>Choura Alexandre (élève — ENSEIRB-MATMECA)</li>
						<li>Gomichon Théo (élève — ENSEIRB-MATMECA)</li>
						<li>Mansouri Othmane (élève — ENSEIRB-MATMECA)</li>
						<li>Saccoccio Clément (élève — ENSEIRB-MATMECA)</li>
						<li>Tilfani Aymen (élève — ENSEIRB-MATMECA)</li>
					</ul>
				</div>
			</main>
		</>
	);
}

export default Legal;
