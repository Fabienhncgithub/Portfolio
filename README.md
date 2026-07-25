# Fabien Hance — Photography portfolio

Portfolio photographique éditorial construit avec Next.js, TypeScript et Framer Motion.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir `http://localhost:3000`.

Le site utilise un contenu de démonstration tant que Strapi n'est pas configuré. Pour connecter
Strapi, copier `.env.example` vers `.env.local`, puis créer une collection `photos` avec les
champs décrits dans `src/lib/photos.ts`.
