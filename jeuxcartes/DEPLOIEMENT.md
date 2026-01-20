# Guide de déploiement - Jeu du Président

## Déploiement sur GitLab Pages + Serveur externe

### 1. Configuration GitLab

Le fichier `.gitlab-ci.yml` est déjà configuré pour builder le projet automatiquement.

### 2. Configuration du serveur backend

Vous aurez besoin d'un serveur Node.js pour héberger le backend (Socket.io).

Options recommandées :
- **Heroku** (gratuit avec limitations)
- **Railway** (gratuit avec limitations)
- **DigitalOcean** (payant, 5$/mois minimum)
- **Render** (gratuit avec limitations)

### 3. Étapes de déploiement

#### A. Déployer le backend

1. Créez un compte sur Railway.app (ou autre plateforme)
2. Créez un nouveau projet
3. Connectez votre dépôt GitLab
4. Railway détectera automatiquement Node.js
5. Définissez la commande de démarrage : `node server/index.js`
6. Récupérez l'URL du serveur (ex: `https://votre-app.railway.app`)

#### B. Configurer le frontend

Dans le fichier `src/App.jsx`, modifiez la ligne :
```javascript
const socket = io('http://localhost:3001');
```

Par :
```javascript
const socket = io('https://votre-app.railway.app');
```

#### C. Pousser sur GitLab

```bash
git add .
git commit -m "Configuration pour production"
git push origin main
```

Le pipeline GitLab CI/CD va automatiquement :
- Installer les dépendances
- Builder le projet
- Créer les artefacts

### 4. Tester localement

```bash
# Installer les dépendances
npm install

# Lancer le serveur et le client
npm run dev:all
```

Ouvrez plusieurs navigateurs sur `http://localhost:3000` pour tester le multijoueur.

### 5. Variables d'environnement

Sur votre plateforme d'hébergement, définissez :
- `PORT` : Le port utilisé (Railway le définit automatiquement)
- `NODE_ENV` : `production`

### 6. Partager avec vos amis

Une fois déployé :
1. Partagez l'URL de votre application
2. Un joueur crée une partie et obtient un code
3. Les autres joueurs rejoignent avec ce code
4. La partie commence automatiquement à 4 joueurs

## Support CORS

Le serveur est configuré pour accepter les connexions de n'importe quelle origine. En production, vous devriez restreindre cela à votre domaine frontend uniquement.

Dans `server/index.js`, modifiez :
```javascript
cors: {
  origin: "https://votre-domaine-gitlab.io",
  methods: ["GET", "POST"]
}
```
