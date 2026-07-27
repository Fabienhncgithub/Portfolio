# Fabien Hance — Photography portfolio

Portfolio photographique éditorial construit avec Next.js, TypeScript et Strapi.

## Démarrer

```bash
pnpm install
pnpm dev
```

Ouvrir `http://localhost:3000`.

## Connecter Strapi

Le site utilise automatiquement le contenu local de `src/content/photos.ts` tant que Strapi
n'est pas disponible. Copier `.env.example` vers `.env.local`, puis renseigner `STRAPI_URL`.

Créer une collection `Photo` avec les champs suivants :

| Champ | Type | Réglage |
| --- | --- | --- |
| `title` | Text | requis |
| `slug` | UID, attaché à `title` | requis et unique |
| `image` | Media, image unique | requis |
| `location` | Text | |
| `year` | Integer | |
| `category` | Enumeration | `Landscape`, `City`, `Travel`, `Details` |
| `camera` | Text | |
| `film` | Text | |

Une image téléversée dans la Media Library n'apparaît pas seule dans le portfolio. Créer une
entrée dans **Content Manager → Photo**, sélectionner cette image dans le champ `image`, puis
cliquer sur **Publish**. Le portfolio affiche uniquement les entrées Photo publiées.

Autoriser `find` et `findOne` sur la collection, ou fournir un `STRAPI_API_TOKEN` en lecture
seule. Les réponses Strapi 4 et 5 ainsi que les URLs de médias relatives sont normalisées dans
`src/lib/cms/strapi.ts`.

## Actualisation du contenu

Les données sont mises en cache pendant 60 secondes. Pour une publication instantanée, créer
un webhook Strapi vers `POST /api/revalidate`, ajouter l'en-tête
`x-revalidate-secret` et utiliser la même valeur dans `STRAPI_WEBHOOK_SECRET`.

## Organisation

- `src/content` : contenu de secours local.
- `src/lib/cms` : accès et normalisation du CMS.
- `src/types` : contrats de contenu partagés.
- `src/components` : composants d'interface.
- `src/app` : routes et composition des pages.
