# 📋 Fiches de Validation – Semaines 2 à 6

Ce document regroupe les checklists et tests nécessaires pour valider chaque étape du projet, de la conception à la gestion complète des stocks.

---

## 🏗️ Semaine 2 : Conception de la Base de Données
**Objectif** : Valider la structure relationnelle et l'intégrité des données.

- [ ] **Tables existantes** : `users`, `products`, `inventory_movements`.
- [ ] **Types ENUM** : `user_role` (RESPONSABLE, EMPLOYE) et `movement_type` (ENTREE, SORTIE, PERTE).
- [ ] **Contraintes** :
    - [ ] Clés primaires sur chaque table.
    - [ ] Clés étrangères (FK) avec `ON DELETE RESTRICT`.
    - [ ] `min_threshold` ≥ 0 dans `products`.
    - [ ] `quantity` > 0 dans `inventory_movements`.
- [ ] **Vues SQL** : `v_product_stock` (calcul dynamique) et `v_alerts_critical_products`.
- [ ] **Indices** : Présence d'index sur les colonnes de filtrage (`product_id`, `user_id`, `created_at`).

---

## ⚙️ Semaine 3 : Infrastructure Backend
**Objectif** : Valider le démarrage du serveur et la connectivité.

- [ ] **Variables d'environnement** : Fichier `.env` configuré (`DB_*`, `JWT_*`).
- [ ] **Connectivité DB** : Le pool `pg` se connecte sans erreur au démarrage.
- [ ] **Route Health** : `GET /api/health` retourne `200 OK` avec le statut de la DB.
- [ ] **Middleware Global** : `CORS` et `express.json()` sont actifs.
- [ ] **Gestion d'erreurs** : Les erreurs 404 (route non trouvée) et 500 sont gérées proprement (format JSON).

---

## 🔐 Semaine 4 : Authentification & RBAC
**Objectif** : Valider la sécurité et les rôles.

- [ ] **Inscription** : `POST /api/auth/register` crée l'utilisateur et hache le mot de passe (`bcrypt`).
- [ ] **Connexion** : `POST /api/auth/login` retourne un Token JWT valide.
- [ ] **JWT** : Le token contient `id`, `username` et `role`.
- [ ] **Middleware Auth** : Les routes `/api/products` rejettent les requêtes sans token (401).
- [ ] **Rôles (RBAC)** :
    - [ ] `EMPLOYE` peut se connecter.
    - [ ] `RESPONSABLE` possède les droits d'écriture sur les routes sensibles.

---

## 📦 Semaine 5 : CRUD Produits
**Objectif** : Valider la gestion du catalogue.

- [ ] **Lecture** : `GET /api/products` accessible par `EMPLOYE` et `RESPONSABLE`.
- [ ] **Création** : `POST /api/products` (Nom obligatoire, Seuil/Quantité ≥ 0).
- [ ] **Modification** : `PUT /api/products/:id` met à jour les champs fournis (COALESCE).
- [ ] **Suppression** : `DELETE /api/products/:id` fonctionne.
- [ ] **Protection** : `POST/PUT/DELETE` retournent `403 Forbidden` si tentés par un `EMPLOYE`.

---

## 📈 Semaine 6 : Gestion des Stocks
**Objectif** : Valider les mouvements et les vues dynamiques.

- [ ] **Mouvements** : `POST /api/inventory-movements` enregistre une transaction.
- [ ] **Validation Mouvement** : Type valide (ENTREE/SORTIE/PERTE) et quantité > 0.
- [ ] **Historique** : `GET /api/inventory-movements/product/:id` affiche l'historique correct.
- [ ] **Calcul de Stock** : Le stock retourné par le backend ou les vues SQL correspond à (Σ ENTREE - Σ SORTIE - Σ PERTE).
- [ ] **Alertes** : Un produit apparaît dans `v_alerts_critical_products` dès que `stock_actuel <= min_threshold`.

---

## 🧪 Séquence de Test Postman (S2-S6)
1. **Health Check** (Vérifier serveur).
2. **Register/Login Admin** (Récupérer token RESPONSABLE).
3. **Register/Login User** (Récupérer token EMPLOYE).
4. **Create Product** (RESPONSABLE).
5. **Add Movement ENTREE** (RESPONSABLE).
6. **Try Add Movement** (EMPLOYE -> doit échouer 403).
7. **Read Product Stock** (Vérifier calcul).
