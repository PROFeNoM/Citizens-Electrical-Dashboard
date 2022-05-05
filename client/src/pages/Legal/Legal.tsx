import './Legal.css';
import { Header } from 'containers';



function Legal() {
	return (
		<>
			<header>
				<Header title={"Mentions"}/>
			</header>
			<main>
					<h2>Propriété intellectuelle</h2>

					<p>
							Selon l'accord oral des clients, les sources du logiciel sont disponibles sous une licence open source au choix de l'équipe de développement. L'ensemble des sources du logiciel est donc licencié sous la GNU General Public License 3.
					</p>

					<h2>Parties prenantes</h2>

					<h3>Encadrant :</h3>
					
					<ul>
						<li>Herbreteau Frédéric (enseignant chercheur — ENSEIRB-MATMECA)</li>
					</ul>

					<h3>Clients :</h3>

					<ul>
						<li>Demay Henry-Pierre (relation collectivités — Enedis)</li>
						<li>Marty Olivier (responsable pôle PMIS — URISA/IESF Nouvelle-Aquitaine)</li>
						<li>Mollard Yoan (ingénieur de recherche en robotique — ENSEIRB-MATMECA)</li>
					</ul>

					<h3>Équipe de développement :</h3>
					<ul>
   							<li>Agtaib Badre Iddine (élève — ENSEIRB-MATMECA)</li>	
							<li>Boitel Faustin (élève — ENSEIRB-MATMECA)</li>	
							<li>Choura Alexandre (élève — ENSEIRB-MATMECA)</li>	
							<li>Gomichon Théo (élève — ENSEIRB-MATMECA)</li>	
							<li>Mansouri Othmane (élève — ENSEIRB-MATMECA)</li>	
							<li>Saccoccio Clément (élève — ENSEIRB-MATMECA)</li>	
							<li>Tilfani Aymen (élève — ENSEIRB-MATMECA)</li>	
					</ul>
			</main>
		</>
	);
}

export default Legal;
