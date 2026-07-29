# TicoqOS — portfolio d'Elie « Tykok » Treport

Portfolio construit comme un OS rétro : gestionnaire de fenêtres maison, barre des
tâches, menu Démarrer, terminal, navigateur, et une poignée d'easter eggs.

React + TypeScript, build Vite. Interface bilingue FR/EN.

## Démarrer

Node est épinglé par `.nvmrc` (voir aussi `engines` dans `package.json`).

```bash
nvm use          # facultatif, aligne la version de Node
npm ci
npm run dev      # http://localhost:3000
```

## Scripts

| Commande             | Effet                                            |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | serveur de dev avec HMR                          |
| `npm run build`      | typecheck puis build de production dans `build/` |
| `npm run preview`    | sert le build de production localement           |
| `npm run typecheck`  | `tsc --noEmit`                                   |
| `npm test`           | suite Vitest, une passe                          |
| `npm run test:watch` | Vitest en watch                                  |
| `npm run lint`       | ESLint sur `src`                                 |
| `npm run lint:fix`   | ESLint avec `--fix`                              |

## Variables d'environnement

Copier `.env.example` en `.env.local` pour surcharger. Préfixe `VITE_` obligatoire
pour qu'une variable soit exposée au client.

| Variable        | Défaut | Effet                                                                 |
| --------------- | ------ | --------------------------------------------------------------------- |
| `VITE_USE_MOCK` | `true` | Sert les projets depuis `src/api/mock/`. À `false`, appelle l'API.    |
| `VITE_API_URL`  | vide   | URL de base de l'API projets. Lue seulement si `VITE_USE_MOCK=false`. |

## Organisation

```
src/
  api/          client HTTP, accès projets, mock
  components/
    apps/       fenêtres applicatives (About, Cv, Projects, Terminal, Web…)
    OS/         couches système (Boot, Login, Bsod, Mascot, KonamiRain…)
    Desktop/    bureau, icônes, menu contextuel
    TaskBar/    barre des tâches, zone de notification, calendrier
    Window/     chrome de fenêtre, barre de titre
  context/      Lang, OS, Window, Projects
  data/         identité, projets, réseaux, badges techno
  i18n/         fr.ts, en.ts, types.ts — source unique des libellés
  styles/       design.css, os.css
```

## Internationalisation

Tous les libellés d'interface vivent dans `src/i18n/{fr,en}.ts`, typés par
l'interface `Translations`. Ajouter une clé, c'est l'ajouter aux trois fichiers —
sinon TypeScript refuse de compiler.

```tsx
const { t, lang } = useLang();

t('cv_exp'); // string
t('t_projects_l', { n: 6 }); // interpolation de {n}
t('cal_months'); // string[] — le type suit la clé
```

Le contenu (identité, projets, CV) utilise un autre motif, `{ fr, en }` par champ,
parce qu'il s'agit de données et non de libellés :

```ts
title: { fr: 'Titre', en: 'Title' }
```

## Tests

Vitest et Testing Library, en jsdom. Les tests couvrent la complétude des locales
(parité des clés fr/en, longueurs des listes), le rendu des apps et le contrat des
données.

```bash
npm test
```
