# Serveur

## Description

### Technologies utilisées

Le serveur web est développé en [TypeScript](https://www.typescriptlang.org/) et tourne dans l'interpréteur [Node.js](https://nodejs.org/en/).
Il gère les requêtes API et sert les fichiers statiques par l'intermédiaire de la bibliothèque [Express](https://expressjs.com/) et il communique avec une base de données [PostgreSQL](https://www.postgresql.org/) à l'aide de l'ORM [typeORM](https://typeorm.io/).

### Schéma de la base de données

![Schéma de la base de données](database.png)

Le schéma de la base est relativement simple.
Elle est plus utilisée pour sa capacité à stocker un grand nombre de données et à faire des opérations rapides sur celles-ci, plutôt que sont aspect relationnel (bien qu'util pour grouper les données par zone).

`Consumption` et `Production` sont des tables "miroir" car elle stockent des données ayant quasiment la même structure (à l'exception du champ `profile`).
Ces deux tables sont référencées indistinctement en tant qua `DataTable`.

Chaque ligne d'une `DataTable` stocke une donnée énergétique au pas de la demi-heure :

- `timestamp` : l'horodatage – un index a été rajouté sur cette colonne pour gagner en efficacité, car toutes les requêtes se font sur un interval de temps donné
- `profile` : une énumération PostgreSQL
	- Dans le cas d'une consommation, une des valeurs suivantes :
		- `PUBLIC_LIGHTING`
		- `PROFESSIONAL`
		- `RESIDENTIAL `
		- `TERTIARY`
	- Dans le cas d'une production, une des valeurs suivantes :
		- `BIOENERGY`
		- `EOLIAN`
		- `HYDRAULIC`
		- `NON_RENEWABLE_THERMAL`
		- `OTHER`
		- `SOLAR`
		- `TOTAL`
- `energy` : l'énergie en W/h
- `prediction` : booléen indiquant si il s'agit d'une véritable donnée historique (`false`) ou d'une prédiction (`true`)
- `zoneId` : ID de la zone que cette donnée énergétique concerne
- `id` : ID interne à la base pour identifier cette ligne

La table `Zone` est là pour identifier différentes zones géographiques.
Dans le cas de la Bastide, il s'agît de sous-quartiers (exemple : "quartier historique Nord Thiers").

Il est à noter que, bien que non mentionnée, la table `typeorm_metadata` sert au fontionnement interne de [typeORM](https://typeorm.io/).

## Mise en place de l’environnement de développement

Pré-requis :

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [PNPM](https://pnpm.io/)

Le téléchargement des sources et l'installations des dépendances se fait comme suit :

```bash
git clone https://gitlab.com/PROFeNoM/dashboard.git
cd dashboard/server
pnpm install
```

Quant à la base de donnée, on peut la lancer et la remplir de donnés factices (mock) comme ceci :

```bash
pnpm build
pnpm generate-mock-data
pnpm load-data-to-db
```

Enfin, pour lancer le serveur en mode "watch" (redémarrage à chaque modification) :

```bash
pnpm watch
```

##  Ajouter des données de prédictions à la base

### Générer les prédictions par Python

Les prédictions peuvent être obtenues par l'intermédiaire du script Python `predictions/generate_csv.py`, en l'utilisant de la manière suivante:

```bash
python generate_csv.py -pm <pm> -pt <pt> -d <d> -e <e> -o <o> -t <t>
```
où:

- pm: Chemin du modèle des courbes moyennes du profil considéré
- pt: Chemin du modèle d'énergie totale du profil considéré
- d: Date de début des prédictions, au format `YYYY-MM-DD`
- e: Date de fin des prédictions, au format `YYYY-MM-DD`
- o: Chemin du fichier de sortie
- t: Profil des prédictions (`RES`, `PRO`, `ENT`, `SOLAR`, ou `LIGHTING`)

Tous les paramètres sont obligatoires pour un fonctionnement cohérent, à l'exception de la situation où le profil de prédictions est `LIGHTING`; dans ce cas, -pm et -pt sont inutiles.

_Exemple d'utilisation_:

```bash
python generate_csv.py -pm models/mean_curve_models/solar.pickle -pt models/total_models/solar.pickle -d 2022-01-01 -e 2022-03-31 -o test2.csv -t SOLAR
```

### Charger les prédictions dans la base

Le chargement des données en base s'appuie sur le script
`load-prediction-to-db.js`, issu de `server/src/scripts/load-predictions-to-db.js`.

**Générer les scripts**

Dans le dossier `server`, lancer la base de données:

```bash
docker-compose up
```

puis:

```bash
pnpm build
```

Un dossier `build` sera alors créé, composé de fichier `.js`.

**Générer les CSV chargeables**

La création des CSV loadable dans la base exploite le script `build/scripts/generate-mock-predictions.js`, issu de `server/src/scripts/generate-mock-predictions.js`, de la manière suivante:

```
node build/scripts/generate-mock-predictions.js <srcPath> <destPath>
```

où:

- srcPath: Chemin du CSV issues du script de prédiction Python
- destPath: Destination du mock csv

_Exemple d'utilisation_:

```bash
node build/scripts/generate-mock-predictions.js ../predictions/sampleForecasts/sampleResT12022.csv raw-data/mock/resR12022Consumption.csv
```

**Charger dans la base**

Il suffit ensuite de se servir du script `load-prediction-to-db.js` de la manière suivante:

```bash
node build/scripts/load-predictions-to-db.js <srcPath> <profileType>
```

où:

- srcPath: Chemin du CSV issu du script de génération de mock
- profileType: Type de profil des prédictions (`consumption`, ou `production`)

_Exemple d'utilisation_:
```bash
node build/scripts/load-prediction-to-db.js raw-data/mock/resT12022Consumption.csv consumption
```
