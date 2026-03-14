# 🚀 Guide de Démarrage - Tableau de Bord Semaine 7

## Prérequis

- ✅ Backend Node.js/Express en cours d'exécution sur `http://localhost:3000`
- ✅ PostgreSQL 18.1 connecté et fonctionnel
- ✅ JWT token d'authentification disponible
- ✅ Node.js v14+ et npm 6+ installés

## Étape 1️⃣ : Démarrer le Backend

```bash
# Terminal 1 - Répertoire backend
cd backend
npm run dev
```

**Résultat attendu:**
```
✓ Server running on http://localhost:3000
✓ PostgreSQL connected successfully
```

## Étape 2️⃣ : Obtenir un Token JWT

### Option A: Via Postman/cURL
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "responsable1",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "status": "success",
  "token": "eyJhbGci..."
}
```

### Option B: Via Script Node
```bash
node backend/check_health.js
```

**Récupérer le token depuis la réponse de connexion.**

## Étape 3️⃣ : Démarrer le Frontend

```bash
# Terminal 2 - Répertoire frontend
cd frontend
npm run dev
```

**Résultat attendu:**
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Étape 4️⃣ : Accéder au Tableau de Bord

1. Ouvrir un navigateur Web
2. Aller à `http://localhost:5173`
3. Le tableau de bord se charge automatiquement

## 🧪 Test de l'API Dashboard

### Test 1: Résumé du Dashboard
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/dashboard/summary
```

**Réponse attendue (200 OK):**
```json
{
  "status": "success",
  "summary": {
    "total_products": 42,
    "total_quantity": 1250,
    "average_stock": 30,
    "critical_products_count": 5
  },
  "critical_products": [...],
  "movements_7days": {...},
  "recent_movements": [...],
  "top_consumption": [...]
}
```

### Test 2: Statistiques Détaillées
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3000/api/dashboard/stats?days=30"
```

**Réponse attendue (200 OK):**
```json
{
  "status": "success",
  "period_days": 30,
  "data": [...]
}
```

## 📊 Affichage du Dashboard

### Vue Mobile (< 768px)
- 1 colonne
- KPIs empilées verticalement
- Produits critiques puis stats puis mouvements

### Vue Tablet (≥ 768px)
- 2-3 colonnes
- Layout horizontal amélioré

### Vue Desktop (≥ 1024px)
- 4-3 colonnes
- Tous les éléments visibles côte à côte

## 🔄 Fonctionnalités Testables

### ✅ Auto-refresh
- Le tableau se met à jour automatiquement toutes les 5 minutes
- Observe le timestamp du bas pour confirmer

### ✅ Bouton Refresh Manual
- Cliquer sur "Actualiser maintenant" met à jour l'affichage immédiatement
- Réinitialise le compte à rebours (5 min)

### ✅ Affichage des KPIs
- **Total Produits**: Nombre total dans la base
- **En Alerte**: Nombre de produits < seuil
- **Ruptures Stock**: Nombre de produits = 0
- **Moyenne Stock**: Stock moyen par produit

### ✅ Produits Critiques
- Affiche jusqu'à 10 produits en alerte
- Badge CRITICAL (rouge) ou WARNING (orange)
- Quantité manquante calculée

### ✅ Statistiques 7 Jours
- ENTREE 📥: Mouvements d'arrivage
- SORTIE 📤: Mouvements de distribution
- PERTE ⚠️: Mouvements d'ajustement/pertes

### ✅ Mouvements Récents
- Tableau des 10 derniers mouvements
- Formatage dates en français (JJ/MM HH:MM)
- Tri par date décroissante

## 🐛 Dépannage

### Erreur: "Failed to fetch dashboard data"
**Cause**: Token JWT invalide ou expiré
**Solution**: 
1. Reconnecter via `/api/auth/login`
2. Copier le nouveau token
3. Recharger la page

### Erreur: "Network error - localhost:3000 unreachable"
**Cause**: Backend not running
**Solution**:
```bash
# Terminal 1
cd backend
npm run dev
```

### Dashboard blanc/vide
**Cause**: Données API manquantes ou erreur parsing
**Solution**:
1. Ouvrir les DevTools (F12)
2. Vérifier l'onglet "Network" → `/api/dashboard/summary`
3. Vérifier l'onglet "Console" pour les erreurs JavaScript

### Styles Tailwind non appliqués
**Cause**: PostCSS/Tailwind not compiling
**Solution**:
```bash
# Arrêter le serveur (Ctrl+C)
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📱 Test sur Mobile

### Via ngrok (expo externe)
```bash
npm install -g ngrok
ngrok http 5173
# Résultat: https://xxx.ngrok.io
```

### Via LAN local
1. Obtenir l'IP locale: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Accéder via `http://YOUR_IP:5173`

## 🎨 Customization

### Changer les couleurs
Éditer `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      'alert-red': '#YOUR_COLOR',
    }
  }
}
```

### Changer l'intervalle d'auto-refresh
Éditer `frontend/src/components/Dashboard.jsx`, ligne ~50:
```javascript
// Changer 300000 (5 min) à votre intervalle en millisecondes
setInterval(() => { fetchDashboardData(); }, 300000);
```

### Ajouter plus de KPIs
1. Modifier la requête SQL dans `backend/src/controllers/dashboard.controller.js`
2. Ajouter un nouveau `<KPICard />` au Dashboard.jsx

## 🔐 Sécurité

⚠️ **ATTENTION**: Le stockage du token dans `localStorage` n'est PAS sécurisé pour la production.

Améliorations recommandées:
- [ ] Utiliser des HttpOnly cookies au lieu de localStorage
- [ ] Implémenter CSRF protection
- [ ] Ajouter Content Security Policy (CSP)
- [ ] HTTPS en production

## 📟 Logs et Debugging

### Backend Logs
```bash
# Voir les requêtes API
cd backend
npm run dev
# Les logs API seront affichés dans la console
```

### Frontend Logs
```bash
# Ouvrir DevTools (F12)
# Console tab affichera les logs:
console.log("Data fetched:", data);
console.error("Error:", error);
```

### Network Inspection
1. F12 → Network tab
2. Rafraîchir la page (Ctrl+R)
3. Filtrer par "Fetch/XHR"
4. Inspecter les requêtes `/api/dashboard/*`

## ✨ Prochaines Étapes

Après confirmation que le dashboard fonctionne:

1. **Ajouter Login Page**: Intégrer React Router pour navigation
2. **Ajouter Products Page**: CRUD interface pour gérer les produits
3. **Ajouter Inventory Page**: Interface pour enregistrer mouvements
4. **Ajouter Graphs**: Intégrer Chart.js pour visualiser tendances
5. **Ajouter Alerts**: WebSocket pour notifications temps-réel

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifier que backend runs on :3000
2. Vérifier que frontend runs on :5173
3. Vérifier les logs dans DevTools (F12)
4. Tester `/api/dashboard/summary` directement via cURL
5. Vérifier que le token JWT est valide

---

**Bon testing! 🎉**
