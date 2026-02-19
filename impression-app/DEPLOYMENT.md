# Déploiement sur Hostinger (imp.innosft.com)

Ce guide décrit le déploiement de l’application **Impression** (Next.js 16) sur un VPS Hostinger avec le domaine **imp.innosft.com**.

## Prérequis sur le serveur

- Accès SSH (ex. `tfksservice@srv1186446`)
- Node.js 20+ (vérifier avec `node -v`)
- npm ou pnpm
- PM2 (optionnel mais recommandé)
- Nginx (si reverse proxy déjà utilisé pour d’autres sites)

---

## 1. Préparer le serveur

### Vérifier / installer Node.js

```bash
node -v   # doit être >= 20
npm -v
```

Si Node.js n’est pas installé ou trop ancien :

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Installer PM2 (recommandé)

```bash
npm install -g pm2
```

---

## 2. Déployer l’application

Structure après clonage : dépôt dans `~/impression/`, app Next.js dans `~/impression/impression-app/`. Tous les fichiers sont dans le dépôt (plus de sous-module).

### Déploiement sur le serveur (après git clone)

```bash
cd ~/impression
git pull
cd impression-app

npm install
npm run build
```

---

## 3. Variables d’environnement

Créer un fichier `.env` ou `.env.local` dans le dossier de l’app (`~/impression/impression-app/`) :

```bash
cd ~/impression/impression-app
nano .env.local
```

Contenu minimal (à adapter) :

```env
# Mots de passe admin (à changer en production)
ADMIN_PASSWORD=votre_mot_de_passe_admin
SUPER_ADMIN_PASSWORD=votre_mot_de_passe_super_admin
```

Sauvegarder (Ctrl+O, Entrée, Ctrl+X).

---

## 4. Lancer l’application avec PM2

```bash
cd ~/impression/impression-app
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup   # suivre les instructions pour démarrage au boot
```

Commandes utiles :

```bash
pm2 status
pm2 logs impression-app
pm2 restart impression-app
pm2 stop impression-app
```

L’app écoute par défaut sur le port **3000** (configurable dans `ecosystem.config.js`).

---

## 5. Exposer avec Nginx (domaine imp.innosft.com)

Si Nginx est déjà installé et utilisé pour d’autres sites (ex. innosft.com), ajouter un bloc pour le sous-domaine.

### Fichier de configuration Nginx

Créer ou éditer un vhost, par exemple :

```bash
sudo nano /etc/nginx/sites-available/imp.innosft.com
```

Contenu type (avec limite d’upload augmentée pour les PDF/Word) :

```nginx
server {
    listen 80;
    server_name imp.innosft.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activer le site et recharger Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/imp.innosft.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### HTTPS avec Let’s Encrypt (recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d imp.innosft.com
```

Suivre les instructions. Certbot mettra à jour la config Nginx pour le HTTPS.

---

## 6. Référencement (SEO)

Le site est configuré pour les recherches « UIDT impression », « InnoSoft impression », etc. :

- **Métadonnées** : titre, description, mots-clés, Open Graph, Twitter Card.
- **JSON-LD** : données structurées (WebSite, Organization) pour les moteurs de recherche.
- **Sitemap** : `https://imp.innosft.com/sitemap.xml`
- **robots.txt** : `https://imp.innosft.com/robots.txt`

Pour accélérer l’indexation : [Google Search Console](https://search.google.com/search-console) → ajouter la propriété `imp.innosft.com` → Sitemaps → soumettre l’URL du sitemap. Définir `NEXT_PUBLIC_SITE_URL=https://imp.innosft.com` dans `.env.local` en production pour que les URLs absolues soient correctes.

---

## 7. DNS

Dans le panneau Hostinger (ou votre gestionnaire DNS), créer un enregistrement pour le sous-domaine :

- **Type** : A (ou CNAME si indiqué)
- **Nom** : `imp` (ou `imp.innosft.com` selon l’interface)
- **Valeur** : IP du VPS (srv1186446)

Attendre la propagation DNS (quelques minutes à quelques heures).

---

## 8. Vérification

1. **Sur le serveur** : `curl http://127.0.0.1:3000` doit renvoyer la page d’accueil.
2. **Depuis l’extérieur** : ouvrir https://imp.innosft.com dans un navigateur.

---

## 9. Mise à jour après modification du code

```bash
cd ~/impression
git pull
cd impression-app
# ou retransférer les fichiers (scp/rsync)
npm install
npm run build
pm2 restart impression-app
```

---

## Dépannage

| Problème | Piste de solution |
|----------|-------------------|
| 502 Bad Gateway | Vérifier que l’app tourne : `pm2 status` et `pm2 logs impression-app`. Vérifier le port dans Nginx (3000). |
| **Styles CSS ne s’affichent pas** (page sans mise en forme) | 1) Rebuild : `cd ~/impression/impression-app && npm run build && pm2 restart impression-app`. 2) Vérifier que Nginx proxy bien tout : le bloc `location /` doit inclure `/_next/` (pas de `location` dédiée qui bloquerait). 3) Vider le cache du navigateur (Ctrl+Shift+Suppr) ou tester en navigation privée. 4) Vérifier que les requêtes `/_next/static/...` renvoient 200 (onglet Réseau des DevTools). |
| Page blanche / erreur | Consulter les logs : `pm2 logs impression-app`, et les logs Nginx : `sudo tail -f /var/log/nginx/error.log`. |
| Erreur au build | Vérifier Node.js >= 20, `npm install` puis `npm run build`. Vérifier les erreurs affichées. |
| Connexion refusée sur le port 3000 | Vérifier le pare-feu (ports 80/443 ouverts, 3000 peut rester en localhost). |

---

## Résumé des chemins (structure après git clone)

- **Dépôt** : `~/impression/`
- **App Next.js** : `~/impression/impression-app/`
- **Port app** : 3000
- **Domaine** : imp.innosft.com
- **Fichier PM2** : `~/impression/impression-app/ecosystem.config.cjs`
- **Variables d’env** : `~/impression/impression-app/.env.local`
