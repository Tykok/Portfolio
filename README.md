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

| Commande               | Effet                                            |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | serveur de dev avec HMR                          |
| `npm run build`        | typecheck puis build de production dans `build/` |
| `npm run preview`      | sert le build de production localement           |
| `npm run typecheck`    | `tsc --noEmit`                                   |
| `npm test`             | suite Vitest, une passe                          |
| `npm run test:watch`   | Vitest en watch                                  |
| `npm run lint`         | ESLint sur tout le dépôt                         |
| `npm run lint:fix`     | ESLint avec `--fix`                              |
| `npm run format`       | Prettier en écriture                             |
| `npm run format:check` | Prettier en vérification, comme la CI            |
| `npm run audit`        | `npm audit --audit-level=high`                   |

## Flux de branches

`develop` est la branche par défaut et la branche d'intégration. `main` reçoit
uniquement ce qui est prêt à être publié.

```
feat/… ─┐
fix/…  ─┼──► develop ──► main
chore/…─┘        ▲
                 └── release/… et hotfix/… peuvent aussi viser main
```

- Toute branche de travail part de `develop` et y retourne par pull request.
- Seules `develop`, `release/*` et `hotfix/*` peuvent viser `main`. C'est
  vérifié par le workflow `branch-policy`, parce que GitHub sait restreindre la
  cible d'une pull request mais pas sa source.
- `main` et `develop` sont protégées : pas de push direct, pas de force-push,
  pas de suppression, et la CI doit être verte avant tout merge.

```bash
git switch develop && git pull
git switch -c feat/mon-sujet
# …
gh pr create --base develop
```

## Intégration continue

`.github/workflows/ci.yml` tourne sur chaque pull request et sur les pushs vers
`main` et `develop` : format, lint, typecheck, tests, build, audit. Chaque étape
s'exécute même si une précédente échoue, pour qu'un seul run rapporte tout.

La version de Node vient de `.nvmrc`, donc la CI et le poste de dev ne peuvent
pas diverger.

`.github/workflows/deploy-script.yml` couvre les scripts de déploiement, sur
changement de `deploy/**` uniquement : le comportement de `deploy-portfolio.sh`
dans un Debian, et celui du vhost Nginx servi pour de vrai.

## Déploiement

`main` est publiée sur <https://tykok.fr>, servie par un Nginx du réseau privé
derrière Traefik. Le build est fait par GitHub Actions, jamais sur la machine.

```
push sur main → build → release GitHub → webhook n8n → SSH → script → symlink basculé
```

Le détail, la mise en place et la procédure de rollback sont dans
[`deploy/README.md`](deploy/README.md).

`develop` n'a pas d'environnement servi : elle est vérifiée par la CI et se
prévisualise avec `npm run preview`.

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
    OS/         couches système (Boot, Login, Bsod, TipsDialog, KonamiRain…)
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
