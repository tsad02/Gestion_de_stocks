# Guide de Test - Semaine 8 Dashboard

## 🚀 Démarrage du Projet

### Étape 1: Base de Données
```bash
# Réinitialiser la base de données avec le nouveau schéma
psql -U votre_utilisateur -d votre_db -f database/db_gestion_de_stocks.sql
```

### Étape 2: Backend
```bash
cd backend
npm install  # Si première fois
node src/server.js
# Ou via start_server.bat
```

Le backend doit écouter sur `http://localhost:5000`

### Étape 3: Frontend
```bash
cd frontend
npm install  # Si première fois
npm run dev
```

Le frontend doit écouter sur `http://localhost:5173`

## ✅ Checklist de Verification

### 1. Authentification
- [ ] Page de login affichée
- [ ] Email/mot de passe testé avec compte existant
- [ ] Token stocké dans localStorage après connexion
- [ ] Redirection vers Dashboard après login

### 2. Dashboard - Chargement
- [ ] Page Dashboard chargée
- [ ] Logo "Tim Hortons" visible en haut
- [ ] Sidebar visible (desktop)
- [ ] Header avec recherche et bouton déconnexion
- [ ] Bouton "Actualiser" avec icône 🔄

### 3. Dashboard - Contenu (avec données)
#### KPIs (5 cartes)
- [ ] "Produits Total" affiche bon nombre
- [ ] "En Alerte" affiche compte correct
- [ ] "Entrées (7j)" affiche bon total
- [ ] "Sorties (7j)" affiche bon total
- [ ] "Pertes (7j)" affiche bon total
- [ ] Tous les KPIs ont des couleurs appropriées

#### Graphique Mouvements
- [ ] Graphique affiche les 7 derniers jours
- [ ] Couleurs correctes: vert (entrée), bleu (sortie), rouge (perte)
- [ ] Legend avec totaux affichée
- [ ] Responsive sur mobile

#### Statitiques Résumé
- [ ] Carte avec 3 stats (Entrées, Sorties, Pertes)
- [ ] Compteurs et quantités visibles
- [ ] Couleurs distinctives

#### Produits Critiques (SI produits en alerte)
- [ ] En-tête rouge/orange visible
- [ ] Liste produits en alerte affichée
- [ ] Pour chaque produit:
  - [ ] Icône 🔴 ou 🟠
  - [ ] Nom et catégorie
  - [ ] Badge CRITIQUE ou ALERTE
  - [ ] Barre progression stock
  - [ ] Quantité à commander
  - [ ] Bouton "Commander"
- [ ] Bouton action global en bas

#### Derniers Mouvements
- [ ] Tableau avec colonnes correctes
- [ ] Au moins 1-10 mouvements affichés
- [ ] Badges de couleurs pour types
- [ ] Dates formatées correctement
- [ ] Noms des utilisateurs affichés
- [ ] Avatars avec initiales

### 4. Dashboard - États

#### Estado de chargement
- [ ] Skeleton loaders visibles au premier chargement
- [ ] Message "actualisation en cours" lors du refresh
- [ ] État revient à normal après

#### État d'erreur
- [ ] Débrancher l'API (arrêter le serveur backend)
- [ ] Charger le dashboard
- [ ] Message d'erreur affiché
- [ ] Bouton "Réessayer" présent et fonctionnel
- [ ] Rebrancher l'API et tester "Réessayer"

#### État vide (sans données)
- [ ] Message "Aucune donnée" affiché si aucun mouvement
- [ ] Icône 📊 et message explicite
- [ ] Layout reste propre et lisible

### 5. Responsivité

#### Mobile (< 768px)
- [ ] Sidebar caché
- [ ] KPIs en colonne unique
- [ ] Graphiques adapté
- [ ] Tableau scrollable horizontalement
- [ ] Aucun contenu cassé
- [ ] Touch-friendly

#### Tablette (768-1024px)
- [ ] KPIs en 2-3 colonnes
- [ ] Layout lisible
- [ ] Graphiques et tableau correctement dimensionnés

#### Desktop (> 1024px)
- [ ] Sidebar visible avec navigation
- [ ] KPIs en 5 colonnes
- [ ] Graphiques côte à côte
- [ ] Spacieux et bien aéré

### 6. Interactions

#### Actualisation
- [ ] Clic sur bouton actualiser
- [ ] Spinner visible
- [ ] Données réactualisées
- [ ] Auto-refresh après 5 minutes

#### Navigation
- [ ] Clic sur Dashboard dans sidebar (si autre page)
- [ ] URL change
- [ ] Dashboard se charge
- [ ] Sidebar highlight "Dashboard" comme active

#### Déconnexion
- [ ] Clic bouton "Déconnexion" en haut
- [ ] Redirection vers page Login
- [ ] Token supprimé de localStorage
- [ ] Données utilisateur supprimées

### 7. Données Réelles

Vérifier que les données affichées correspondent aux données réelles en BD:

```sql
-- Vérifier les produits
SELECT COUNT(*) FROM products;

-- Vérifier les mouvements
SELECT COUNT(*) FROM inventory_movements;

-- Vérifier les produits critiques
SELECT * FROM v_alerts_critical_products;

-- Vérifier les mouvements derniers jours
SELECT DATE(created_at), type, SUM(quantity) 
FROM inventory_movements 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), type
ORDER BY DATE(created_at) DESC;
```

Comparer avec les affichages du Dashboard.

### 8. Performance

- [ ] Dashboard charge en < 2 secondes (première fois)
- [ ] Pas de lag lors du scroll du tableau
- [ ] Transitions fluides
- [ ] Pas de tremblements sur les graphiques
- [ ] Refresh rapide

### 9. Correcteurs d'Erreur Connus

#### Erreur: "Column 'category' does not exist"
✅ **FIXE** - Vue `v_alerts_critical_products` mise à jour

#### Erreur: "Column 'username' does not exist"
✅ **FIXE** - Changé en `full_name` dans tous les contrôleurs

#### Pas de données affichées
- Vérifier que des produits existent en BD
- Vérifier que des mouvements existent en BD (derniers 7 jours au minimum)
- Vérifier la connexion à la BD
- Voir les logs du backend pour erreurs

#### Erreur Authentication
- Vérifier que le token est stocké en localStorage
- Vérifier que le token n'est pas expiré
- Vérifier les en-têtes Authorization sur les requêtes

## 🧪 Scénarios de Test Complets

### Scénario 1: Nouveau Produit en Alerte
1. Ajouter un produit avec seuil minimum (ex: 50)
2. Réduire son stock < seuil via mouvement
3. Rafraichir le Dashboard
4. Vérifier que le produit apparait en "Produits Critiques"
5. Vérifier les couleurs et badge ALERTE

### Scénario 2: Mouvements Récents
1. Créer plusieurs mouvement (ENTREE, SORTIE, PERTE)
2. Rafraichir le Dashboard
3. Vérifier qu'ils apparaissent dans tableau "Derniers Mouvements"
4. Vérifier que les KPIs sont à jour
5. Vérifier que le graphique affiche le jour courant

### Scénario 3: Rupture de Produit
1. Réduire stock d'un produit à 0
2. Rafraichir
3. Vérifier qu'il apparait en alerte CRITIQUE
4. Vérifier le badge et les couleurs
5. Vérifier la quantité à commander

### Scénario 4: Filtre sur 7 jours
1. Créer mouvements sur différentes dates
2. Rafraichir
3. Vérifier que seuls les 7 derniers jours sont affichés
4. Vérifier les totaux par jour

## 📝 Rapport de Test

Remplir ce rapport après testing:

| Zone | Statut | Notes |
|------|--------|-------|
| Authentication | ✅/❌ | |
| KPIs Display | ✅/❌ | |
| Graphiques | ✅/❌ | |
| Produits Critiques | ✅/❌ | |
| Mouvements Récents | ✅/❌ | |
| États (Charge/Erreur/Vide) | ✅/❌ | |
| Responsivité | ✅/❌ | |
| Performance | ✅/❌ | |
| Données Réelles | ✅/❌ | |

## 🐛 Signalement de Bugs

Si vous trouvez un bug, vérifiez:

1. **Console du navigateur** (F12) pour erreurs JS
2. **Onglet Network** pour erreurs API
3. **Logs du backend** pour erreurs serveur
4. **Logs de la BD** pour erreurs SQL

Format de signalement:
```
Titre: [Brève description]
Description: [Détails du bug]
Étapes pour reproduire:
1. ...
2. ...
3. ...
Résultat attendu: [Ce qui devrait se passer]
Résultat actuel: [Ce qui se passe réellement]
Screenshots/Logs: [Attachments]
```

## ✅ Checklist Finale

- [ ] Tous les tests passent
- [ ] Aucune erreur majeure
- [ ] Performance acceptable
- [ ] Données correctes
- [ ] Design professionnel
- [ ] Responsive sur tous les appareils
- [ ] Déploiement validé

---
**Dashboard Semaine 8: PRÊT POUR PRODUCTION**
