import './About.css';

import React from 'react';

import { Header } from 'containers';

/**
 * Page that contains informations about the project.
 * 
 * @see Error
 * @see Legal
 * @see Home
 */
export default class About extends React.Component<{}, {}> {
	render() {
		return (
			<>
				<header>
					<Header title='À propos' />
				</header>
				<main>
					<div id="about-text-wrapper">
						<h2>Principe</h2>
						<p>
							Le Tableau Électrique Citoyen (TEC) est une preuve de concept sous forme de site web, permettant de suivre la consommation et la production électrique d'un quartier, ainsi que de prévoir, grâce au machine learning, les futures consommations et productions.
						</p>
						<p>
							Cette preuve de concept se focalise uniquement sur le quartier de la Bastide, à Bordeaux, et présente des données factices.
						</p>

						<h2>Contexte</h2>
						<p>
							Le TEC est un Projet au Fil de l'Année (PFA) développé par des élèves de l'école ENSEIRB-MATMECA sur l'année scolaire 2021/2022.
						</p>
						<p>
							Les PFA sont des projets réalisés en équipe, lors de la deuxième année de la formation, avec la participation de clients (ici Enedis, l'ENSEIRB-MATMECA et l'URISA/IESF Nouvelle-Aquitaine). Ils permettent d'avoir un premier aperçu de la gestion d'un projet dans un environnement un peu moins académique et plus professionnel.
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
}
