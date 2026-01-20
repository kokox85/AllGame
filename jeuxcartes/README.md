# Jeu du Président - Multijoueur

Un jeu de Président en ligne avec des règles spéciales.

## Installation

```bash
npm install
```

## Développement

Lancer le serveur et le client en même temps :
```bash
npm run dev:all
```

Ou séparément :
```bash
npm run server  # Port 3001
npm run dev     # Port 3000
```

## Build pour production

```bash
npm run build
```

## Déploiement sur GitLab

Le fichier `.gitlab-ci.yml` est configuré pour automatiser le déploiement.

## Règles du jeu

- 4 joueurs
- Échange de cartes selon les rôles (Président, Vice-Président, Vice Trou Duc, Trou Duc)
- Règle "Uno" avec bouton aléatoire
- Règle spéciale 6-7 avec bouton rapide
