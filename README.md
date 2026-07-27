# Photography Portfolio

Portfolio photographique éditorial mobile-first conçu avec Next.js, TypeScript et Strapi.

L’interface privilégie les images, la fluidité et une expérience responsive adaptée à chaque
format : grille éditoriale, couleurs dominantes, navigation tactile, pages photo immersives et
contenu administré depuis un CMS headless.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Responsive et breakpoints](#responsive-et-breakpoints)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Connecter Strapi](#connecter-strapi)
- [Actualisation du contenu](#actualisation-du-contenu)
- [SEO et Analytics](#seo-et-analytics)
- [Commandes disponibles](#commandes-disponibles)
- [Architecture du projet](#architecture-du-projet)
- [Déploiement](#déploiement)

## Fonctionnalités

- Grille photographique responsive pour ordinateur, tablette et mobile.
- Mise en avant de la photographie située au centre de l’écran.
- Aplats générés depuis la couleur dominante de chaque image.
- Navigation mobile par balayage vers la gauche ou la droite.
- Retour à la position précédente dans la galerie après consultation d’une photo.
- Navigation au clavier sur ordinateur.
- Contenu administrable avec Strapi et contenu local de secours.
- Images optimisées par Next.js en AVIF et WebP.
- Métadonnées SEO, Open Graph, Twitter Cards, sitemap et robots.txt.
- Données structurées Schema.org.
- Respect de `prefers-reduced-motion`.

## Stack technique

| Technologie | Usage |
| --- | --- |
| [Next.js](https://nextjs.org/) | App Router, rendu, optimisation des images et SEO |
| [React](https://react.dev/) | Interface utilisateur |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Strapi](https://strapi.io/) | CMS headless et médiathèque |
| [GSAP](https://gsap.com/) | Animations et transitions |
| [Sass](https://sass-lang.com/) | Styles modulaires et responsive |
| [pnpm](https://pnpm.io/) | Gestion des dépendances et workspace |

## Responsive et breakpoints

L’expérience est pensée mobile-first : navigation tactile, balayage entre les photographies,
zones interactives adaptées au pouce et sélection de l’image située au centre de l’écran.
L’interface évolue ensuite progressivement pour exploiter les grilles multicolonnes, le pointeur
précis et les écrans de grande largeur.

Les breakpoints sont centralisés dans `src/styles/_breakpoints.scss` :

| Nom | Largeur | Usage principal |
| --- | --- | --- |
| `phone` | jusqu’à `426px` | Téléphones compacts |
| `phone-wide` | de `496px` à `767px` | Téléphones larges |
| `tablet` | de `768px` à `1023px` | Tablettes |
| `tablet-wide` | de `820px` à `1023px` | Tablettes larges |
| `laptop` | à partir de `1024px` | Ordinateurs portables |
| `desktop` | à partir de `1366px` | Écrans de bureau |
| `wide` | à partir de `1920px` | Écrans haute définition |
| `short-screen` | hauteur maximale de `44rem` | Écrans larges de faible hauteur |

Une media query dédiée à `prefers-reduced-motion` désactive les animations non essentielles.

## Démarrage rapide

### Prérequis

- Node.js 20 ou plus récent.
- pnpm 10 ou plus récent.

### Installation

```bash
git clone https://github.com/Fabienhncgithub/Portfolio.git
cd Portfolio
pnpm install
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Le frontend reste fonctionnel sans Strapi : lorsque le CMS n’est pas configuré ou indisponible,
les photographies de `src/content/photos.ts` sont utilisées automatiquement.

## Configuration

Copier le fichier d’exemple :

```bash
cp .env.example .env.local
```

| Variable | Obligatoire | Description |
| --- | --- | --- |
| `STRAPI_URL` | Pour le CMS | URL privée utilisée par Next.js pour interroger Strapi |
| `STRAPI_API_TOKEN` | Non | Jeton Strapi en lecture seule si l’API n’est pas publique |
| `STRAPI_WEBHOOK_SECRET` | Non | Secret partagé utilisé par le webhook de revalidation |
| `NEXT_PUBLIC_SITE_URL` | Production | URL canonique utilisée pour le SEO et le sitemap |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Non | Identifiant Google Analytics 4 au format `G-…` |

Ne jamais placer un jeton privé Strapi dans une variable commençant par `NEXT_PUBLIC_`.

## Connecter Strapi

Un projet Strapi est inclus dans le dossier `cms`.

```bash
pnpm cms:dev
```

Par défaut :

- le frontend est disponible sur `http://localhost:3000` ;
- Strapi est disponible sur `http://localhost:1337`.

### Collection recommandée

Créer une collection `Photo` avec les champs suivants :

| Champ | Type | Réglage |
| --- | --- | --- |
| `title` | Text | Requis |
| `slug` | UID attaché à `title` | Requis et unique |
| `image` | Media, image unique | Requis |
| `location` | Text | Facultatif |
| `year` | Integer | Facultatif |
| `category` | Enumeration | `Landscape`, `City`, `Travel`, `Details` |
| `camera` | Text | Facultatif |
| `film` | Text | Facultatif |

Dans **Content Manager → Photo**, créer une entrée, sélectionner une image, compléter ses
informations puis cliquer sur **Publish**.

Autoriser `find` et `findOne` pour la collection `Photo`, ou fournir un
`STRAPI_API_TOKEN` disposant uniquement des droits de lecture nécessaires.

### Images de la Media Library

La collection `Photo` reste le mode recommandé, car elle permet de contrôler le titre, le slug,
le lieu, l’année et les informations techniques.

Les images présentes uniquement dans la Media Library sont également importées lorsqu’elles ne
sont associées à aucune entrée `Photo`. Leur titre est déterminé dans cet ordre :

1. `title` ;
2. texte alternatif ;
3. légende ;
4. nom du fichier.

Les réponses Strapi 4 et 5 ainsi que les URLs de médias relatives sont normalisées dans
`src/lib/cms/strapi.ts`.

## Actualisation du contenu

Les données Strapi sont mises en cache pendant 60 secondes.

Pour déclencher une mise à jour immédiate après une publication :

1. définir `STRAPI_WEBHOOK_SECRET` dans l’environnement du frontend ;
2. créer un webhook Strapi vers `POST /api/revalidate` ;
3. ajouter l’en-tête `x-revalidate-secret` ;
4. utiliser la même valeur secrète des deux côtés.

Une requête valide invalide le cache associé au tag `photos`.

## SEO et Analytics

Le projet génère automatiquement :

- les métadonnées générales et celles de chaque photographie ;
- les URL canoniques ;
- les données Open Graph et Twitter Cards ;
- une image de partage sociale ;
- `/robots.txt` ;
- `/sitemap.xml` ;
- les données structurées `WebSite` et `Person`.

Définir `NEXT_PUBLIC_SITE_URL` avec le domaine final avant le déploiement.

Google Analytics n’est pas chargé tant que l’intégration et le consentement ne sont pas activés.
L’identifiant GA4 sera fourni avec `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

## Commandes disponibles

| Commande | Description |
| --- | --- |
| `pnpm dev` | Démarre le frontend en développement |
| `pnpm build` | Crée et valide le build de production |
| `pnpm start` | Démarre le frontend compilé |
| `pnpm lint` | Analyse le code avec ESLint |
| `pnpm cms:dev` | Démarre Strapi en développement |
| `pnpm cms:build` | Compile l’administration Strapi |

## Architecture du projet

```text
.
├── cms/                  # Projet Strapi
├── public/               # Ressources statiques
├── src/
│   ├── app/              # Routes, layouts, SEO et endpoints
│   ├── components/       # Composants d’interface
│   ├── content/          # Contenu photographique local de secours
│   ├── lib/
│   │   └── cms/          # Accès et normalisation des données Strapi
│   ├── styles/           # Styles globaux et breakpoints
│   └── types/            # Contrats de contenu partagés
├── .env.example          # Variables d’environnement documentées
└── pnpm-workspace.yaml   # Workspace frontend et CMS
```

## Déploiement

Avant la mise en production :

1. configurer les variables d’environnement ;
2. rendre Strapi accessible depuis le serveur Next.js ;
3. vérifier les permissions en lecture de l’API ;
4. définir le domaine canonique avec `NEXT_PUBLIC_SITE_URL` ;
5. exécuter les validations :

```bash
pnpm lint
pnpm build
pnpm cms:build
```
