# Prédictions des données énergétiques

## Technologies utilisées

La prédiction des données énergétiques a utilisé Python 3.7 et le package open-source Prophet afin de produire les modèles de prédictions.

Par ailleurs, les Jupyter Notebooks, utilisés pour l'analyse des performances des modèles, sont disponibles dans le dossier `notebooks` dans la branche `machine-learning`. Certains de ces notebooks nécessitent l'installation supplémentaire de NeuralProphet ou Keras/Tensorflow.

### Installation des packages nécessaires

Afin de pouvoir utiliser le script de génération Python (3.7), il est nécessaire d'avoir les packages nécessaires installés dans son environnement (pandas, numpy, matplotlib, pystan, scipy, ephem, scikit-learn, prophet, plotly).

Il est possible d'obtenir un environnement viable à l'aide du fichier de spécification d'environnement conda, situé à `predictions/env.txt`.

Il suffit alors d'installer les packages de cet environnement:

```bash
conda create --name dashboard-env --file env.txt
```

puis de l'activer:

```bash
conda activate dashboard-env
```

## Modèles de prédictions

Les modèles de prédictions ont été sérialisés avec Pickle, et sont disponibles dans le répertoire `predictions/models`.

### Diversité des modèles

Deux types de modèles sont mis à disposition :

- Des modèles de prédictions énergétique de courbe moyennes, dans le dossier `mean_curve_models`
- Des modèles de prédiction énergétique d'énergie injectée/soutirée, dans le dossier `total_models`

Chacun de ces dossiers est composés de quatre modèles, afin de correspondre aux différents profils de consommation :

- Tertiaire: `ent.pickle`
- Professionnel: `pro.pickle`
- Résidentiel: `res.pickle`

et de production:

- Solaire: `solar.pickle`

Il n'y a pas de modèles de prédictions de consommation des dispositifs d'éclairage publique. Le script `generate_csv.py` réutilise directement les données historiques.

### Utiliser les modèles

Les modèles, étant sérialisés, peuvent être utilisés _as is_, sans avoir besoin de les ré-entraîner.

**Charger un modèle**

Un modèle peut être load de la façon suivante (disponible dans `generate_csv.py`):

```python
import pickle

def load_model(modelPath):
    return pickle.load(open(model, 'rb'))
```

L'objet retourné peut alors être utilisé selon la documentation de Prophet.

**Prédire avec un modèle**

La prédiction suit l'utilisation décrite dans la documentation de Prophet.

Ainsi, il faut tout d'abord créer une dataframe viable pour les prédictions, tenant compte des régresseurs s'il y en a. Une telle fonction est disponible dans `generate_csv.py`:
```python
make_df(date_start, date_end, capacity, floor, extended_dataframe=False):
```

Il est à noté qu'actuellement, seulement les prédictions de consommation professionnelles nécessitent des régresseurs. Par ailleurs, les capacities/floors des différents modèles sont définies en variables globales de ce script, respectivement `CAPACITY` et `FLOOR`.

Les prédictions (standardisées) peuvent ensuite être réalisées à l'aide de la méthode `predict` d'un objet Prophet. Cependant, la fonction
```python
make_forecast(model, df, std, mean)
```
peut être utilisée afin de réaliser des prédictions dé-standardisées des modèles, où std/mean sont définies en variables globales de ce script, respectivement `STD` et `MEAN`.

### Générer ou modifier les modèles

Les paramétrisation et entraînement des modèles a été effectuée dans des Jupyter Notebooks, accessibles à travers la branche `machine-learning`. Ainsi, la modification des modèles peut s'y effectuer.

Cependant, dès lors qu'un modèle est modifié, il faut alors modifier les valeurs correspondantes dans les quatres variables globales `CAPACITY`, `STD`, et `MEAN`, si l'on souhaite utiliser correctement `generate_csv.py`.

- STD correspond à la déviation standard des données d'entraînement pour la colonne cible
- MEAN correspond à la moyenne des données d'entraînement pour la colonne cible
- CAPACITY correspond au maximum de la colonne `y` des données standardisés (multipliée par un facteur 1.2, dans lesdits modèles)
