# syntax=docker/dockerfile:1

# --- construction ------------------------------------------------------------
# Doit suivre .nvmrc à la main : FROM est résolu avant que Docker n'ait
# accès aux fichiers du contexte, donc rien ne peut lire .nvmrc ici.
ARG NODE_VERSION=20.14
FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

# Copiés seuls d'abord : la couche npm ci est réutilisée tant que le lockfile
# ne bouge pas.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Une URL vide expédierait un canonical et un og:url pointant sur localhost.
# Le build de production doit refuser plutôt que de laisser passer.
ARG VITE_SITE_URL
RUN test -n "${VITE_SITE_URL}" || { echo 'VITE_SITE_URL est vide' >&2; exit 1; }

ENV VITE_SITE_URL=${VITE_SITE_URL}
RUN npm run build

# Utiles dans un artefact de CI, pas sur un site public.
RUN find build -name '*.map' -delete

# --- service -----------------------------------------------------------------
# Image non privilégiée : tourne en uid 101 et écoute sur 8080, ce qui permet
# runAsNonRoot dans le Deployment sans contorsion.
FROM nginxinc/nginx-unprivileged:1.31.5-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080
