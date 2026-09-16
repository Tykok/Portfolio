# Sons système

L'OS cherche ici sept fichiers. Chacun est **facultatif** : absent, il est
remplacé par un équivalent synthétisé à l'oscillateur (`src/audio/sounds.ts`),
et l'interface reste entièrement sonore.

| Fichier attendu | Joué quand            | Source Windows XP habituelle   |
| --------------- | --------------------- | ------------------------------ |
| `boot.wav`      | démarrage de l'OS     | `Windows XP Startup.wav`       |
| `click.wav`     | clic sur un contrôle  | `Windows XP Start.wav`         |
| `menu.wav`      | bouton Démarrer, menu | `Windows XP Menu Command.wav`  |
| `open.wav`      | ouverture de fenêtre  | `Windows XP Restore Up.wav`    |
| `close.wav`     | fermeture de fenêtre  | `Windows XP Restore Down.wav`  |
| `minimize.wav`  | réduction de fenêtre  | `Windows XP Minimize.wav`      |
| `error.wav`     | écran bleu            | `Windows XP Critical Stop.wav` |

Les fichiers XP se trouvent dans `C:\Windows\Media\` sur une machine Windows.
Les noms exacts varient selon l'édition : n'importe quel `.wav` court fait
l'affaire, seul le nom de destination compte.

## Ces fichiers ne sont pas versionnés

`.gitignore` exclut `public/sounds/*.wav`. Les sons Windows appartiennent à
Microsoft ; les committer les publierait avec un site public et son image
Docker. Déposés ici, ils ne sortent pas de la machine — le site déployé, lui,
garde les sons synthétisés.

Pour les servir malgré tout en production, il faut retirer la ligne du
`.gitignore` et ajouter les fichiers sciemment.

## Format

`.wav` PCM, court. Ils sont chargés au premier affichage et décodés au premier
clic ; un fichier lourd retarde d'autant le premier son, jamais l'affichage.
Le niveau de lecture est ramené à 55 % dans `src/audio/engine.ts`
(`SAMPLE_GAIN`), les enregistrements d'origine étant bien plus forts que les
tons de synthèse.
