# Photography Portfolio

Portfolio photographique éditorial, mobile-first, construit avec Next.js, TypeScript et Strapi.

L’interface place les images au premier plan : grille responsive, aplats calculés depuis la
couleur dominante de chaque photographie, navigation tactile, pages photo immersives et retour
précis dans la galerie.

## Fonctionnalités

- Galerie éditoriale adaptée au mobile, à la tablette et au desktop.
- Photographie active déterminée par sa position réelle au centre du viewport.
- Aplat propre à chaque image, synchronisé avec le bandeau de titre sur mobile.
- Navigation par swipe sur la scène photo et par clavier avec `←`, `→` et `Échap`.
- Retour vers la photographie courante après Previous, Next ou swipe.
- Images optimisées en AVIF et WebP par Next.js.
- Contenu Strapi privé avec contenu local de secours explicite.
- Métadonnées SEO, Open Graph, Twitter Cards, sitemap, robots.txt et Schema.org.
- États de focus visibles et prise en charge de `prefers-reduced-motion`.

## Stack

| Technologie | Usage |
| --- | --- |
| Next.js 15 | App Router, rendu, optimisation d’images et SEO |
| React 19 | Interface utilisateur |
| TypeScript | Typage du frontend et du CMS |
| Strapi 5 | CMS headless et médiathèque |
| GSAP | Animations et transitions |
| Sass Modules | Styles isolés et responsive |
| OpenNext | Bundle Cloudflare Workers |
| pnpm 10 | Gestion des dépendances |

## Responsive

Les breakpoints sont centralisés dans `src/styles/_breakpoints.scss`.

| Palier | Largeur | Comportement |
| --- | --- | --- |
| `phone` | jusqu’à `426px` | Téléphones compacts |
| `mobile` | jusqu’à `767px` | Grille simple et bandeau compact |
| `tablet` | `768px` à `1199px` | Grille sur deux colonnes |
| `laptop` | dès `1200px` | Rail latéral et grille sur trois colonnes |
| `desktop` | dès `1366px` | Galerie élargie |
| `wide` | dès `1920px` | Mise en page centrée haute définition |

Un mode compact supplémentaire s’active sur les écrans tactiles de moins de `1200px` et
`512px` de hauteur, notamment les téléphones en paysage.

## Démarrage

### Prérequis

- Node.js `20.9` à `26`.
- pnpm `10.15.1` ou compatible.

```bash
git clone https://github.com/Fabienhncgithub/Portfolio.git
cd Portfolio
pnpm install
pnpm --dir cms install
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Sans CMS disponible, le frontend utilise les photographies de secours définies dans
`src/content/photos.ts`.

## Configuration du frontend

```bash
cp .env.example .env.local
```

| Variable | Usage |
| --- | --- |
| `STRAPI_URL` | URL serveur de Strapi, en HTTPS hors développement local |
| `STRAPI_API_TOKEN` | Token privé en lecture seule, requis lorsque Strapi est connecté |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Identifiant du flux Web GA4 au format `G-XXXXXXXXXX` |
| `STRAPI_WEBHOOK_SECRET` | Secret aléatoire d’au moins 32 caractères pour la revalidation |
| `CMS_REQUIRED` | Mettre à `true` en production pour refuser un fallback silencieux |
| `NEXT_PUBLIC_SITE_URL` | URL canonique publique : `https://www.fabienhance.com` |

Les tokens et secrets restent exclusivement côté serveur. Ne jamais les préfixer par
`NEXT_PUBLIC_` et ne jamais committer `.env.local`.

## Google Analytics 4

Le tag Google n’est jamais chargé avant un consentement explicite. Les signaux publicitaires,
la personnalisation et le stockage publicitaire restent désactivés. Le visiteur peut modifier
son choix via **Analytics settings** dans le pied de page.

Événements mesurés :

| Événement | Utilité |
| --- | --- |
| `page_view` | Pages visitées et navigation Next.js |
| `photo_open` | Photographie ouverte depuis la galerie |
| `photo_navigation` | Utilisation de Previous ou Next |
| `gallery_return` | Retour à la galerie par l’image ou le bouton de fermeture |
| `outbound_click` | Clic vers Instagram |
| `photo_engagement` | Photographie gardée au premier plan pendant 10 ou 30 secondes |

Dans le flux Web GA4, désactiver **Page changes based on browser history events** pour éviter
de compter deux fois les pages vues : l’application envoie déjà les changements de route.

Créer ensuite les dimensions personnalisées de portée **Event** :
`photo_slug`, `photo_title`, `direction`, `method` et `destination`. Créer également la métrique
personnalisée `engagement_seconds`. Ces données permettent de comparer ouvertures, temps
d’attention, navigation et sorties Instagram dans **Explore → Free form**.

## Strapi

Le CMS est inclus dans `cms`.

```bash
cp cms/.env.example cms/.env
pnpm cms:dev
```

L’administration est disponible sur [http://localhost:1337/admin](http://localhost:1337/admin).

### Collection `Photo`

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

Créer une entrée dans **Content Manager → Photo**, sélectionner une image, renseigner son texte
alternatif dans la médiathèque puis cliquer sur **Publish**. Seules les entrées `Photo` publiées
sont affichées ; une image isolée dans la Media Library n’est jamais importée automatiquement.

### Accès privé

Le bootstrap révoque les permissions du rôle **Public** et désactive l’inscription publique.
Créer dans **Settings → API Tokens** un token limité à la lecture de `Photo`, puis le placer dans
`STRAPI_API_TOKEN`. Le token ne doit pas donner de droit d’écriture ni d’accès à l’administration.

En production, utiliser PostgreSQL ou MySQL avec TLS, définir `PUBLIC_URL` en HTTPS et générer des
valeurs indépendantes et aléatoires pour tous les secrets documentés dans `cms/.env.example`.

## Publication et cache

Les réponses Strapi sont mises en cache pendant 60 secondes. Pour une publication immédiate :

1. définir le même `STRAPI_WEBHOOK_SECRET` côté frontend et webhook ;
2. créer un webhook Strapi vers `POST /api/revalidate` ;
3. ajouter l’en-tête `x-revalidate-secret`.

La route refuse les secrets absents ou trop courts et invalide uniquement le tag `photos`.

## Builds reproductibles

Les commandes de build ignorent Strapi par défaut afin qu’un CMS local ou une URL
`localhost` ne soit jamais intégrée par erreur dans un artifact de production.

```bash
pnpm build
pnpm build:hosting
```

Pour construire volontairement avec un CMS de production :

```bash
BUILD_WITH_STRAPI=true \
STRAPI_URL=https://cms.example.com \
STRAPI_API_TOKEN=your-read-only-token \
CMS_REQUIRED=true \
pnpm build:hosting
```

Le vérificateur de bundle contrôle le pont de compatibilité Worker et refuse les URLs de médias
Strapi locales.

## Qualité et sécurité

```bash
pnpm lint
pnpm typecheck
pnpm cms:typecheck
pnpm check
pnpm cms:build
```

Le workflow GitHub Actions exécute les contrôles frontend/CMS et le build OpenNext à chaque pull
request et push sur `master`. Dependabot surveille le frontend, le CMS et les actions GitHub.

Le frontend ajoute notamment une Content Security Policy, bloque l’intégration en iframe,
désactive `X-Powered-By`, restreint les permissions navigateur et refuse une URL Strapi HTTP en
production. HSTS doit être activé uniquement lorsque l’apex et `www` répondent tous deux
définitivement en HTTPS.

## Architecture

```text
.
├── cms/                         # Strapi 5
├── public/                      # Assets statiques
├── scripts/                     # Builds et vérifications de production
├── src/
│   ├── app/                     # Routes, SEO et endpoint de revalidation
│   ├── components/
│   │   └── PhotoGrid/           # Contrôleurs pointeur, tactile et couleurs
│   ├── content/                 # Photographies locales de secours
│   ├── lib/
│   │   └── cms/                 # Accès et normalisation Strapi
│   ├── styles/                  # Base visuelle et breakpoints
│   └── types/                   # Contrats de contenu
├── .env.example
└── wrangler.jsonc
```

## Déploiement

Avant une mise en production :

1. exécuter `pnpm check`, `pnpm cms:build` et `pnpm build:hosting` ;
2. définir l’URL canonique et les secrets dans la plateforme, jamais dans Git ;
3. connecter le token Strapi en lecture seule et activer `CMS_REQUIRED=true` ;
4. publier uniquement l’artifact produit par OpenNext ;
5. vérifier `https://www.fabienhance.com`, la redirection de l’apex et
   `https://cms.fabienhance.com`.

`wrangler.jsonc` active la compatibilité Node requise par Next.js. Le script
`scripts/patch-open-next-worker.mjs` ajoute le pont CommonJS nécessaire à l’hébergement Workers
managé.
