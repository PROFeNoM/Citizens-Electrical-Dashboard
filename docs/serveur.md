# Serveur

##  Ajouter des données de prédictions à la base

### Générer les prédictions par Python

Les prédictions peuvent être obtenues par l'intermédiaire du script Python `predictions/generate_csv.py`, en l'utilisant de la manière suivante:

```bash
python generate_csv.py -pm <pm> -pt <pt> -d <d> -e <e> -o <o> -t <t>
```
où:

- pm: Chemin du modèle des courbes moyennes du profil considéré
- pt: Chemin du modèle d'énergie totale du profil considéré
- d: Date de début des prédictions, au format `YYYY-MM-DD```
- e: Date de fin des prédictions, au format `YYYY-MM-DD```
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
