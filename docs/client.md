# Client

## Technologies utilisées

La partie client a été développée en [TypeScript](https://www.typescriptlang.org/) avec le framework [React](https://fr.reactjs.org/).
Concernant la carte et les graphiques, ils ont été intégrés à la page grâces aux bibliothèques [Mapbox](https://www.mapbox.com/) et [CanvasJS](https://canvasjs.com/react-charts/).

## Lancement de l'application pour le développement

Pré-requis :

- [Node.js](https://nodejs.org/en/)
- [PNPM](https://pnpm.io/)

Le téléchargement des sources et l'installations des dépendances se fait comme suit :

```bash
git clone https://gitlab.com/PROFeNoM/dashboard.git
cd dashboard/client
pnpm install
```

Enfin, pour lancer le client en mode "watch" (mise à jour de la page à chaque modification) :

```bash
pnpm start
```

## Implémentation des indicateurs

Les indicateurs ont été implémentés sous forme de composants React. Ces derniers sont accessibles dans le dossier `client/src/components/indicators`, où ils y sont séparés selon leur thématique :

- `Global` pour les indicateurs d'informations globales
- `Consumption` pour les indicateurs de consommation énergétiques
- `Production` pour les indicateurs de production énergétiques
- `ChargingStations` pour indicateurs concernant les bornes de recharges

Notons que les indicateurs "graphiques" implémentés utilisent la librairie [canvasjs-react-charts](https://www.npmjs.com/package/canvasjs-react-charts).

## Gestion de l'affichage des composants

### Sélection des ressources à présenter

La sélection des ressources présentées est gérée par le composant `DataContainer` (`containers/DataContainer/DataContainer.tsx`). C'est ce composant qui, par son état, détient et permet de changer les informations affichées (l'indicateur, la zone urbaine, la filière de consommation, les limites temporelles, et la zone mise en valeur). C'est ce composant qui, en fournissant sa méthode `setState` à ses composants enfants, va permettre la représentation cohérente de la page décidée par l'utilisateur.

`DataContainer` permet à son enfant `IndicatorContainer` de changer son état courant (à travers le passage de `setState`). Ainsi, l'enfant `IndicatorMenu` de `IndicatorContainer`, par la récupération de ces méthodes de gestion de l'état de `DataContainer` en props, pourra changer l'état parent en fonction des entrées utilisateur.

Ainsi, par changement d'état de `DataContainer`, les autres composants enfants seront mis à jour par le passage de nouveaux props. De cette manière, en fonction de leurs props, `MapContainer` et `IndicatorViewer` vont pouvoir mettre à jour leur rendu.

### Ajout d'un indicateur

Supposons que l'on veuille ajouter un nouvel indicateur `IsometricProduction` (nom arbitraire).

Par symétrie d'implémentation des indicateurs, la première étape correspond à la réalisation d'une class enfant de `React.Component<Props, State>` dans le dossier de `components/indicators` correspondant. Cette nouvelle classe dotée d'une méthode ``render`` permettra la représentation visuelle de l'indicateur.

La prochaine étape (non nécessaire) correspond à l'ajout de la classe `IsometricProduction` dans `components/indicators/index.ts` par l'ajout de son chemin :
```ts
export { default as IsometricProduction } from './Production/IsometricProduction/IsometricProduction'
```

La considération de ce nouvel indicateur s'effectue dans `constants/indicators.ts`.
Il faut tout d'abord l'ajouter à l'énumération `IndicatorType` (en ajoutant `IsometricProduction` dans l'exemple proposé).

Dans ce même fichier, il faut enregistrer ce nouvel indicateur par la fonction `registerIndicator`:
```ts
function registerIndicator(indicatorClass: IndicatorClass, indicatorType: IndicatorType, name: string): void
```
où:

- indicatorClass représente la thématique de l'indicateur, et définie par l'énumération `IndicatorClass`
- indicatorType, correspondant au nouvel élément de l'énumération `IndicatorType` précédemment ajouté
- name, correspondant au nom affiché de l'indicateur.

Ainsi, dans notre exemple, nous aurions: 
```ts
registerIndicator(IndicatorClass.Production, IndicatorType.IsometricProduction, 'Représentation isométrique');
```

Enfin, il faut gérer l'affichage du nouvel indicateur dans le composant IndicatorViewer (`containers/IndicatorContainer/IndicatorViewer.tsx`).
Il suffit alors d'importer le nouvel indicateur :
```ts
import { IsometricProduction } from 'components/Indicators';
```

puis de l'ajouter par un `case` dans la classe `IndicatorViewer` (le choix des props s'y effectue). Dans notre exemple, nous pourrions alors avoir :
```ts
case IndicatorType.IsometricProduction:
    return (
        <IsometricProduction
        t1={this.props.t1.getTime()}
        t2={this.props.t2.getTime()}
        zoneName={this.props.zoneName}
        buildingType={this.props.buildingType}
        />
    );
```

## Relations entre les différents composants

### Architecture des composants de représentation spatiale

La gestion des composants de représentation spatiale, i.e., les cartes, est assurée par le composant `MapContainer`.

Ce dernier a une dépendance fonctionnelle avec le composant `UrbanZonesMap`, permettant de gérer les layers `Mapbox` à afficher. Cette dernière utilise le composant `BaseMap`, correspondant à la carte du quartier de la Bastide, utilisant la librairie `mapbox-gl`.

### Communication entre la carte et les composants

Les indicateurs de type donut (notamment) nécessite la mise à jour de la carte lors d'un clic sur une de ses zones, afin de pouvoir surligner la zone en question.

Cette communication est permise grâce au passage de la méthode `setHighlightedZone` de `DataContainer` en props de son composant enfant `IndicatorContainer`, puis en props au composant enfant `IndicatorViewer`; méthode qui sera alors utilisée par le composant de l'indicateur afin de spécifier la zone mise en valeur.

La mise à jour de l'état de `DataContainer` permettra ainsi la mise à jour correspondante de la carte par l'update de son composant enfant `MapContainer`.
