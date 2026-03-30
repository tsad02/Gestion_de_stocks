# Semaine 7 - Tableau de Bord Interactif (Frontend)

## 📋 Objectifs de la Semaine 7

- ✅ Créer un tableau de bord React avec Tailwind CSS
- ✅ Intégrer les données de l'API backend
- ✅ Afficher les KPI (Indicateurs clés de performance)
- ✅ Montrer les produits en alerte critiques
- ✅ Visualiser les statistiques de mouvements de stock (7 jours)
- ✅ Afficher les mouvements récents en temps quasi-réel

## 🏗️ Architecture du Frontend

### Tech Stack
- **Framework UI**: React 18.2.0 (CSR - Client Side Rendering)
- **Routing**: React Router 6.8.0 (peut être utilisé pour futures pages)
- **Styling**: Tailwind CSS 3.2.4 (Utility-first CSS)
- **Communication API**: Axios 1.3.0 (HTTP Client)
- **Charting**: Chart.js 4.2.0 + react-chartjs-2 5.2.0 (pour futurs graphiques)
- **Build Tool**: Vite 4.1.0 (Dev server + Production bundling)
- **Entry Point**: Node.js executable, Vite dev server sur port 5173

### Structure des Dossiers

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Composant principal du tableau de bord
│   │   ├── KPICard.jsx            # Carte d'indicateur clé (réutilisable)
│   │   ├── CriticalProducts.jsx   # Liste des produits en alerte
│   │   ├── MovementStats.jsx      # Statistiques de mouvements (7 jours)
│   │   └── RecentMovements.jsx    # Tableau des mouvements récents
│   ├── services/
│   │   └── dashboardAPI.js        # Service API pour les appels backend
│   ├── App.jsx                    # Composant racine React
│   ├── main.jsx                   # Point d'entrée Vite
│   └── index.css                  # Styles Tailwind + customs
├── index.html                     # Template HTML
├── package.json                   # Dépendances npm
├── vite.config.js                 # Configuration Vite (proxy, port 5173)
├── tailwind.config.js             # Configuration Tailwind CSS
├── postcss.config.js              # Configuration PostCSS
└── node_modules/                  # Dépendances installées (149 packages)
```

## 🎨 Composants Détaillés

### 1. **Dashboard.jsx** (Composant Principal)
**Responsabilités**: Orchestration, récupération de données, gestion d'état
- État: `data`, `loading`, `error`, `lastUpdate`
- Effet: Récupère les données au montage et toutes les 5 minutes
- Layout:
  - Header: Titre "Tableau de Bord" + timestamp du dernier update
  - 4 KPI Cards (Total Produits, En Alerte, Ruptures, Moyenne Stock)
  - Grille 3 colonnes: Produits Critiques (1 col) + Stats (1 col) + Récents (2 cols)
  - TableauMovements (full width)
  - Résumé Stock (card gradient)
  - Auto-refresh toutes les 5 min + bouton refresh manuel

### 2. **KPICard.jsx** (Métrique d'Indicateur)
**Props**: 
- `title`: Texte de l'indicateur
- `value`: Nombre/valeur
- `icon`: Icône emoji ou élément
- `color`: blue | green | orange | red | purple
- `subtitle`: (Optionnel) Texte secondaire

**Variants de couleur**:
- blue: Totaux généraux
- green: Résultats positifs
- orange: Avertissements
- red: Critiques/Ruptures
- purple: Statistiques de tendance

### 3. **CriticalProducts.jsx** (Produits en Alerte)
**Props**: 
- `products`: Tableau des produits en alerte

**Affichage**:
- Badge couleur en fonction du niveau:
  - CRITICAL (stock ≤ 50% du seuil) = 🔴 Rouge
  - WARNING (stock ≤ seuil) = 🟠 Orange
- Informations: Nom, catégorie, stock actuel, seuil minimum, quantité manquante
- Scrollable verticalement (max-h-96)
- État vide: "Aucun produit en alerte ✅"

### 4. **MovementStats.jsx** (Statistiques 7 Jours)
**Props**: 
- `movements`: Objet { entries, exits, losses }

**Affichage** (3 colonnes):
- **ENTREE** 📥 (Vert): Nombre de mouvements entrée + quantité totale
- **SORTIE** 📤 (Bleu): Nombre de mouvements sortie + quantité totale
- **PERTE** ⚠️ (Rouge): Nombre de mouvements perte + quantité totale
- En-tête: Total mouvements (7j) + Quantité totale déplacée
- Responsive: Stack sur mobile, grille 3 cols sur desktop

### 5. **RecentMovements.jsx** (Mouvements Récents)
**Props**: 
- `movements`: Tableau des 10 derniers mouvements

**Colonnes du tableau**:
- Type (badge couleur + icône)
- Produit (nom)
- Quantité
- Utilisateur (user_name)
- Date (format: JJ/MM HH:MM)

**Styling**:
- Hover effect sur les lignes
- Badges: ENTREE (vert) | SORTIE (bleu) | PERTE (rouge)
- Tri: Plus récent en haut
- États: Empty si aucun mouvement

## 🔌 API Integration

### Service API (dashboardAPI.js)
```javascript
// Fetch du résumé du dashboard
getSummary() → GET /api/dashboard/summary

// Fetch des statistiques détaillées
getStats(days = 30) → GET /api/dashboard/stats?days=30
```

### Réponse API `/api/dashboard/summary`
```json
{
  "status": "success",
  "summary": {
    "total_products": 42,
    "total_quantity": 1250,
    "average_stock": 30,
    "critical_products_count": 5
  },
  "critical_products": [
    {
      "id": 1,
      "name": "Tomate",
      "category": "Légumes",
      "stock": 5,
      "min_threshold": 20,
      "alert_level": "CRITICAL",
      "quantity_needed": 15
    }
  ],
  "movements_7days": {
    "entries": { "count": 15, "quantity": 320 },
    "exits": { "count": 28, "quantity": 410 },
    "losses": { "count": 3, "quantity": 12 }
  },
  "recent_movements": [
    {
      "id": 1,
      "type": "ENTREE",
      "product_name": "Oeufs",
      "quantity": 50,
      "user_name": "Alice Martin",
      "movement_date": "2024-01-15T14:30:00"
    }
  ],
  "top_consumption": [
    { "product": "Pain", "quantity": 150 }
  ]
}
```

## 🚀 Commandes de Démarrage

### Installation des dépendances
```bash
cd frontend
npm install
```
✅ **Complétée** - 149 packages installés

### Démarrage du serveur de développement
```bash
npm run dev
```
- Ouvre automatiquement http://localhost:5173
- Hot reload activé (modifications en temps réel)
- Proxy API vers http://localhost:3000

### Build pour production
```bash
npm run build
```
- Crée le dossier `dist/` avec les fichiers optimisés

### Aperçu de la build
```bash
npm run preview
```

## ⚙️ Configuration Détaillée

### Vite Config (vite.config.js)
- Port: 5173
- Proxy: `/api/*` → `http://localhost:3000`
- Plugin React: Transformation JSX

### Tailwind Config (tailwind.config.js)
- Colors personnalisées: alert-red, alert-orange, alert-yellow, stock-green
- Animations: fadeIn (0.5s ease-in-out), spin (rotation)
- Content paths: ./index.html, ./src/**/*.{js,jsx}

### PostCSS Config (postcss.config.js)
- Tailwindcss processor
- Autoprefixer pour la compatibilité navigateurs

## 🎯 Fonctionnalités Implémentées

### Tableau de Bord
✅ Récupération données auto au montage du composant
✅ Actualisation automatique toutes les 5 minutes
✅ Gestion des erreurs avec retry button
✅ État de chargement avec spinner
✅ Layout responsive (mobile-first avec breakpoints md/lg)
✅ Dark/Light mode compatible (via Tailwind)

### Affichage des Données
✅ 4 KPI cards avec valeurs dynamiques
✅ Liste produits critiques triés par urgence
✅ Statistiques mouvement (ENTREE/SORTIE/PERTE)
✅ Tableau mouvements récents avec formatage date
✅ Indicateurs de stock global

### État et Erreurs
✅ Try-catch globale dans les appels API
✅ Affichage messages d'erreur utilisateur
✅ Bouton "Réessayer" lors d'erreurs
✅ Indicateur de chargement lors de fetch
✅ Timestamp du dernier update affiché

## 🔐 Sécurité

- ✅ Token JWT récupéré depuis `localStorage.getItem('token')`
- ✅ Envoyé dans header `Authorization: Bearer {token}`
- ✅ Backend valide le token via middleware `verifyToken`
- ✅ RBAC appliquée: Accessible à EMPLOYE et RESPONSABLE
- ✅ Produits sensibles: Pas d'exposition de données utilisateur

## 📊 Prochaines Étapes (Semaines 8-10)

### Semaine 8 - Système d'Alerts & Notifications
- [ ] Ajouter alertes temps réel pour produits critiques
- [ ] WebSocket pour notifications push
- [ ] Email/SMS alerts configurables
- [ ] Historique des alertes

### Semaine 9 - Dashboard Avancé
- [ ] Graphiques Chart.js pour tendances
- [ ] Filtres par catégorie/lieu
- [ ] Export données (CSV/PDF)
- [ ] Commentaires sur les mouvements

### Semaine 10 - Finalisation & Production
- [ ] Optimisation performance (lazy loading, code splitting)
- [ ] Tests unitaires avec Jest/React Testing Library
- [ ] Tests E2E avec Cypress/Playwright
- [ ] Déploiement sur Azure App Service
- [ ] Documentation utilisateur

## ✅ Checklist Semaine 7

- ✅ Backend: Controller API + routes créées
- ✅ Frontend: Composants React implémentés (5 fichiers)
- ✅ Styling: Tailwind CSS configured + index.css
- ✅ API Service: dashboardAPI.js avec méthodes getSummary/getStats
- ✅ Config: vite.config.js, tailwind.config.js, postcss.config.js
- ✅ Entry Points: App.jsx, main.jsx, index.html
- ✅ Dependencies: npm install (149 packages)
- ✅ State Management: useState + useEffect dans Dashboard
- ✅ Error Handling: Try-catch + UI feedback
- ✅ Auto-refresh: 5-minute interval + manual button

## 🎓 Points d'Apprentissage

1. **React Hooks**: useState, useEffect, cleanup functions
2. **Component Composition**: Reusable KPICard component
3. **API Integration**: Service pattern avec dashboardAPI
4. **Tailwind CSS**: Responsive design, color variants, animations
5. **Vite Dev Server**: Hot reload, proxy configuration
6. **Error Handling**: Frontend error boundaries et user feedback
7. **Time-based Updates**: setInterval + cleanup
8. **Data Fetching**: Async operations et loading/error states

## 📝 Notes Technique

- Tous les chemins d'import utilisent des chemins relatifs
- localStorage utilisé pour le token JWT (non sécurisé pour production)
- Auto-refresh peut être désactivé par l'utilisateur si nécessaire
- API returns données formatées en JSON
- Dates formatées en local français (dd/mm hh:mm)
- Composants stateless sauf Dashboard (maintenant avec état)
