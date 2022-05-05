import './About.css';
import { Header } from 'containers';

function About() {
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
				</div>
			</main>
		</>
	);
}

export default About;
