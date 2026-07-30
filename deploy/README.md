# Déploiement — homelab

`tykok.fr` est servi par un Nginx du réseau privé, derrière Traefik. Le build est
fait par GitHub Actions, jamais sur la machine.

## Le chemin complet

```
push sur main
   │
   ▼
GitHub Actions ── build (VITE_SITE_URL=https://tykok.fr)
   │              ── site.tar.gz + site.tar.gz.sha256
   │              ── release build-<n>, make_latest
   │
   ├── POST https://n8n.tykok.fr/webhook/portfolio-deploy
   │        header X-Deploy-Token
   ▼
n8n (LAN) ── SSH sur la machine Nginx
   │
   ▼
deploy-portfolio.sh ── télécharge releases/latest/download/site.tar.gz
                    ── vérifie le sha256
                    ── extrait dans releases/<hash>
                    ── bascule le symlink current, atomiquement
```

Le dépôt étant public, les assets de release se téléchargent sans
authentification : **aucun credential GitHub n'est nécessaire sur la box**.

## Pourquoi le script n'accepte aucun paramètre

Le webhook n8n est joignable depuis internet, c'est le principe même. Quiconque
découvre son URL peut donc provoquer une exécution.

Le script ne lit ni argument, ni stdin, ni environnement du caller : le dépôt et
l'URL de téléchargement sont écrits en dur. Un appel forgé ne peut donc pas le
détourner vers un autre artefact — au pire il redéploie la release qui allait
l'être de toute façon. Le `X-Deploy-Token` évite le bruit, il n'est pas ce sur
quoi repose la sécurité.

C'est le point à ne pas assouplir : dès que le script fait confiance à un tag ou
une URL venant du payload, quelqu'un peut faire servir son propre contenu sur
`tykok.fr`.

## Mise en place

### 1. Sur la machine Nginx

```bash
sudo mkdir -p /var/www/portfolio/releases
sudo chown -R deploy:www-data /var/www/portfolio
sudo chmod 755 /var/www/portfolio

sudo install -m 750 -o deploy -g deploy \
  deploy/bin/deploy-portfolio.sh /usr/local/bin/deploy-portfolio.sh

sudo cp deploy/nginx/tykok.fr.conf /etc/nginx/sites-available/tykok.fr
sudo ln -s /etc/nginx/sites-available/tykok.fr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Ajuster `set_real_ip_from` dans le vhost avec l'adresse de Traefik, puis
décommenter la ligne.

Premier déploiement à la main, pour vérifier avant de brancher n8n :

```bash
sudo -u deploy /usr/local/bin/deploy-portfolio.sh
```

### 2. La clé SSH de n8n, restreinte

n8n n'a besoin que de lancer un script. Une clé dédiée avec `command=` force
cela : quelle que soit la commande envoyée, seul le script s'exécute.

```bash
# sur la machine qui héberge n8n
ssh-keygen -t ed25519 -f ~/.ssh/portfolio-deploy -C 'n8n portfolio deploy' -N ''
```

Dans `/home/deploy/.ssh/authorized_keys` sur la machine Nginx, sur une ligne :

```
command="/usr/local/bin/deploy-portfolio.sh",restrict ssh-ed25519 AAAA…  n8n portfolio deploy
```

`restrict` désactive port forwarding, agent forwarding, X11 et pty. Sans le
`command=`, une clé compromise donnerait un shell.

Vérification :

```bash
ssh -i ~/.ssh/portfolio-deploy deploy@<nginx> 'echo ceci-est-ignore'
# doit exécuter le déploiement, pas afficher « ceci-est-ignore »
```

### 3. Le workflow n8n

Deux nœuds suffisent.

**Webhook** — méthode `POST`, chemin `portfolio-deploy`. Ajouter un nœud IF
juste après qui compare `{{ $json.headers['x-deploy-token'] }}` au jeton
attendu, et coupe sinon. Répondre `200` immédiatement : le déploiement dure
plusieurs secondes et GitHub n'a pas besoin d'attendre.

**SSH** — hôte = la machine Nginx, utilisateur `deploy`, authentification par la
clé privée générée plus haut. Commande : n'importe quoi, elle est ignorée à cause
du `command=`. Mettre `deploy` pour la lisibilité.

L'URL complète du webhook sera de la forme :

```
https://n8n.tykok.fr/webhook/portfolio-deploy
```

### 4. Traefik

```bash
sudo cp deploy/traefik/portfolio.yml /etc/traefik/dynamic/portfolio.yml
```

Ajuster l'adresse du Nginx sous `http.services`, et `certResolver` si le tien ne
s'appelle pas `letsencrypt`.

`stsSeconds` est déjà à un an. Ne l'activer qu'une fois le HTTPS confirmé
fonctionnel : les navigateurs mémorisent le HSTS, et un `max-age` posé trop tôt
est pénible à défaire.

### 5. Les secrets GitHub

Dans **Settings → Secrets and variables → Actions** :

| Secret             | Valeur                                          |
| ------------------ | ----------------------------------------------- |
| `N8N_DEPLOY_URL`   | `https://n8n.tykok.fr/webhook/portfolio-deploy` |
| `N8N_DEPLOY_TOKEN` | le jeton que le nœud IF de n8n vérifie          |

Si `N8N_DEPLOY_URL` est absent, le workflow publie quand même la release et
émet un avertissement — le déploiement peut alors se faire à la main.

## Rollback

Les cinq dernières releases restent sur le disque.

```bash
ls -lt /var/www/portfolio/releases
sudo -u deploy ln -sfnT /var/www/portfolio/releases/<hash> /var/www/portfolio/.next-current
sudo -u deploy mv -fT /var/www/portfolio/.next-current /var/www/portfolio/current
# neutralise le témoin, sinon le script considère la version courante déjà à jour
sudo -u deploy rm -f /var/www/portfolio/.deployed-sha256
```

Aucun reload Nginx : le symlink est résolu à chaque requête.

## Vérifier un déploiement

```bash
curl -sI https://tykok.fr | head -5
curl -s https://tykok.fr | grep -E 'canonical|og:image'
# doit afficher https://tykok.fr/, jamais localhost ni __SITE_URL__
```

## Ce qui n'est pas fait

- Pas d'environnement d'intégration : `develop` est vérifiée par la CI et se
  prévisualise en local avec `npm run preview`. Un second vhost sur un
  sous-domaine suffirait à en ajouter un.
- Pas de purge de cache CDN, il n'y a pas de CDN.
- Le script ne prévient de rien en cas d'échec : il sort en code non nul et n8n
  le voit. Un nœud de notification côté n8n serait le bon endroit.
