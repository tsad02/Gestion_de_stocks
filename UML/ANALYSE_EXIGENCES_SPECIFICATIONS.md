# 📋 Document d'Analyse des Exigences et Spécifications
## Système de Gestion de Stocks

**Project**: Système de Gestion de Stocks  
**Version**: 1.0  
**Date**: Mars 2026  
**Auteur**: TSAFACK TALLA 
**Statut**: En cours

---

## Table des Matières

1. [Vue d'ensemble du système](#vue-densemble)
2. [Exigences fonctionnelles](#exigences-fonctionnelles)
3. [Exigences non-fonctionnelles](#exigences-non-fonctionnelles)
4. [Modèle de données](#modèle-de-données)
5. [Architecture du système](#architecture-du-système)
6. [Spécifications techniques](#spécifications-techniques)
7. [Contraintes et limitations](#contraintes-et-limitations)

---

## Vue d'ensemble

### Objectif
Fournir une API REST robuste permettant aux restaurants et commerces de gérer efficacement leurs stocks de produits, avec un système d'authentification sécurisé et un contrôle d'accès basé sur les rôles (RBAC).

### Portée
- ✅ Gestion complète des produits (CRUD)
- ✅ Authentification et autorisation
- ✅ Suivi des mouvements d'inventaire
- ✅ Alertes de seuil minimal
- ✅ API REST documentée

### Utilisateurs cibles
- **Responsables** : Accès complet (création, modification, suppression)
- **Employés** : Accès en lecture seule (consultation)

---

## Exigences Fonctionnelles

### 1. Authentification et Sécurité

#### 1.1 Inscription utilisateur
**ID**: RF-AUTH-001  
**Description**: Permettre à un nouvel utilisateur de créer un compte  
**Acteurs**: Utilisateur non authentifié  
**Entrées**:
- `full_name` (string, obligatoire) : Nom complet de l'utilisateur
- `email` (string, obligatoire, unique) : Adresse email
- `password` (string, obligatoire, min 6 caractères) : Mot de passe
- `role` (enum, optionnel, défaut: EMPLOYE) : RESPONSABLE | EMPLOYE

**Processus**:
1. Valider que l'email n'existe pas déjà
2. Hacher le mot de passe avec bcrypt (10 salt rounds)
3. Créer l'utilisateur en base de données
4. Générer un JWT token (expire dans 8h)
5. Retourner l'utilisateur et le token

**Sorties**:
- User object avec id, full_name, email, role, created_at
- JWT token pour la session

**Codes d'erreur**:
- 400: Email déjà existant, champs obligatoires manquants
- 500: Erreur serveur

---

#### 1.2 Connexion utilisateur
**ID**: RF-AUTH-002  
**Description**: Authentifier un utilisateur et obtenir un JWT token  
**Acteurs**: Utilisateur non authentifié  
**Entrées**:
- `email` (string, obligatoire) : Adresse email
- `password` (string, obligatoire) : Mot de passe

**Processus**:
1. Chercher l'utilisateur par email
2. Comparer le mot de passe avec bcrypt
3. Générer un JWT token (expire dans 8h)
4. Retourner le token

**Sorties**:
- JWT token valide

**Codes d'erreur**:
- 401: Identifiants invalides
- 500: Erreur serveur

---

#### 1.3 Contrôle d'Accès (RBAC)
**ID**: RF-AUTH-003  
**Description**: Appliquer le contrôle d'accès basé sur les rôles  
**Rôles et permissions**:

| Opération | RESPONSABLE | EMPLOYE |
|-----------|---|---|
| Lister les produits | ✅ | ✅ |
| Voir détails produit | ✅ | ✅ |
| Ajouter produit | ✅ | ❌ |
| Modifier produit | ✅ | ❌ |
| Supprimer produit | ✅ | ❌ |
| Consulter mouvements | ✅ | ✅ |

---

### 2. Gestion des Produits

#### 2.1 Lister tous les produits
**ID**: RF-PROD-001  
**Description**: Récupérer la liste de tous les produits  
**Acteurs**: RESPONSABLE, EMPLOYE  
**Paramètres**: Aucun (à améliorer: pagination, filtrage)  
**Réponse**:
```json
[
  {
    "id": 1,
    "name": "Tomate",
    "category": "Légume",
    "unit": "kg",
    "min_threshold": 5,
    "quantity": 12,
    "created_at": "2026-03-09T10:00:00Z"
  }
]
```

---

#### 2.2 Récupérer un produit par ID
**ID**: RF-PROD-002  
**Description**: Obtenir les détails d'un produit spécifique  
**Acteurs**: RESPONSABLE, EMPLOYE  
**Paramètres**: `id` (integer, obligatoire)  
**Réponse**: Objet produit complet  
**Codes d'erreur**:
- 404: Produit non trouvé
- 400: ID invalide

---

#### 2.3 Ajouter un produit
**ID**: RF-PROD-003  
**Description**: Créer un nouveau produit en stock  
**Acteurs**: RESPONSABLE  
**Entrées**:
- `name` (string, obligatoire, non-vide) : Nom du produit
- `category` (string, optionnel) : Catégorie (ex: Légume, Fruit, Produit laitier)
- `unit` (string, optionnel) : Unité de mesure (kg, L, unité, etc.)
- `min_threshold` (integer, optionnel, défaut: 0, ≥ 0) : Seuil d'alerte
- `quantity` (integer, optionnel, défaut: 0) : Quantité initiale

**Validations**:
- `name` : Ne peut pas être vide ou null
- `min_threshold` : Doit être ≥ 0
- `quantity` : Doit être ≥ 0

**Codes d'erreur**:
- 400: Validation échouée
- 401: Non autorisé (n'est pas RESPONSABLE)
- 500: Erreur serveur

---

#### 2.4 Modifier un produit
**ID**: RF-PROD-004  
**Description**: Mettre à jour les informations ou le stock d'un produit  
**Acteurs**: RESPONSABLE  
**Paramètres**: `id` (integer, obligatoire)  
**Entrées**: Tous les champs de produit sont optionnels  
**Validations**: Mêmes que RF-PROD-003  
**Codes d'erreur**:
- 404: Produit non trouvé
- 400: Validation échouée
- 401: Non autorisé
- 500: Erreur serveur

---

#### 2.5 Supprimer un produit
**ID**: RF-PROD-005  
**Description**: Supprimer un produit de la base de données  
**Acteurs**: RESPONSABLE  
**Paramètres**: `id` (integer, obligatoire)  
**Contrainte**: Impossible de supprimer si des mouvements d'inventaire existent (intégrité référentielle)  
**Codes d'erreur**:
- 404: Produit non trouvé
- 409: Conflict - Impossibilité de supprimer (mouvements liés)
- 401: Non autorisé
- 500: Erreur serveur

---

### 3. Mouvements d'Inventaire (À implémenter)

#### 3.1 Créer un mouvement d'inventaire
**ID**: RF-MOVE-001  
**Description**: Enregistrer une entrée, sortie ou perte de stock  
**Acteurs**: RESPONSABLE, EMPLOYE  
**Entrées**:
- `product_id` (integer, obligatoire) : ID du produit
- `type` (enum, obligatoire) : ENTREE | SORTIE | PERTE
- `quantity` (integer, obligatoire, > 0) : Quantité
- `reason` (string, optionnel) : Raison du mouvement

**Processus**:
1. Valider que le produit existe
2. Créer l'enregistrement de mouvement
3. Mettre à jour automatiquement la quantité du produit

---

### 4. Alertes et Rapports

#### 4.1 Produits en alerte
**ID**: RF-ALERT-001  
**Description**: Identifier les produits avec stock faible  
**Critères**: `stock_actuel <= min_threshold`  
**À implémenter**: Vue SQL `v_alerts_critical_products`

---

## Exigences Non-Fonctionnelles

### 1. Performance
- **Temps de réponse**: < 200ms pour 95% des requêtes
- **Concurrent Users**: Support de minimum 100 utilisateurs simultanés
- **Indexation DB**: Indexes sur product_id, user_id, created_at

### 2. Sécurité
- **Authentification**: JWT tokens avec expiration 8h
- **Chiffrement**: Hachage des mots de passe avec bcrypt (10 rounds)
- **Validations**: Validation SERVER-SIDE de toutes les entrées
- **CORS**: Activé pour les requêtes cross-origin
- **SQL Injection**: Prévention via prepared statements (parameterized queries)

### 3. Disponibilité
- **Uptime**: Objectif 99.5% disponibilité
- **Backup**: Sauvegardes journalières de la base de données PostgreSQL
- **Recovery**: Procédure de récupération documentée

### 4. Maintenabilité
- **Code**: Commenté et bien structuré
- **Middleware centralisé**: Gestion d'erreurs centralisée
- **Logs**: Système de logging pour audit et debugging
- **Documentation**: README, commentaires de code, cette spécification

### 5. Compatibilité
- **API Rest**: Suivant les standards REST
- **Format données**: JSON pour requêtes et réponses
- **Browsers**: Support des navigateurs modernes (Chrome, Firefox, Safari, Edge)

---

## Modèle de Données

### Schéma ER (Entité-Relation)

```
┌──────────┐         ┌─────────────────────┐         ┌──────────┐
│  users   │         │ inventory_movements │         │ products │
├──────────┤         ├─────────────────────┤         ├──────────┤
│ id (PK)  │────────→│ user_id (FK)        │ ←────── │ id (PK)  │
│ full_name│    ╱    │ product_id (FK) ────┤─────┐   │ name     │
│ email    │   ╱     │ type                │     │   │ category │
│ password │  ╱      │ quantity            │     │   │ unit     │
│ role     │ ╱       │ reason              │     │   │ min_thre-│
│ created_ │         │ created_at          │     │   │ quantity │
│ at       │         └─────────────────────┘     │   │ created_ │
└──────────┘                                     │   │ at       │
                                                 └───┤───────────┘
```

### Table: users

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| full_name | VARCHAR(120) | NOT NULL | Nom complet |
| email | VARCHAR(180) | NOT NULL, UNIQUE | Adresse email unique |
| password_hash | TEXT | NOT NULL | Mot de passe hashé |
| role | user_role ENUM | NOT NULL, DEFAULT 'EMPLOYE' | RESPONSABLE ou EMPLOYE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création |

---

### Table: products

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| name | VARCHAR(160) | NOT NULL | Nom du produit |
| category | VARCHAR(120) | NOT NULL | Catégorie |
| unit | VARCHAR(40) | - | Unité de mesure |
| min_threshold | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Seuil minimal |
| quantity | INTEGER | DEFAULT 0 | Quantité en stock |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date de création |

---

### Table: inventory_movements

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| id | SERIAL | PRIMARY KEY | Identifiant unique |
| product_id | INTEGER | NOT NULL, FK ON DELETE RESTRICT | Référence produit |
| user_id | INTEGER | NOT NULL, FK ON DELETE RESTRICT | Référence utilisateur |
| type | movement_type ENUM | NOT NULL | ENTREE, SORTIE, PERTE |
| quantity | INTEGER | NOT NULL, CHECK > 0 | Quantité du mouvement |
| reason | VARCHAR(255) | - | Raison du mouvement |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date du mouvement |

---

### Enums

**user_role**: `RESPONSABLE` | `EMPLOYE`  
**movement_type**: `ENTREE` | `SORTIE` | `PERTE`

---

## Architecture du Système

### Architecture en Couches

```
┌─────────────────────────────────────────┐
│        CLIENT (Frontend/Postman)        │
├─────────────────────────────────────────┤
│   HTTP/REST (Port 3000)                 │
├─────────────────────────────────────────┤
│  Express.js Application Server          │
│  ┌────────────────────────────────────┐ │
│  │ Routes (auth, products, health)    │ │
│  ├────────────────────────────────────┤ │
│  │ Middleware (Auth, ErrorHandler)    │ │
│  ├────────────────────────────────────┤ │
│  │ Controllers (Logique métier)       │ │
│  └────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Data Layer (pg pool)                   │
├─────────────────────────────────────────┤
│  PostgreSQL Database                    │
│  (users, products, inventory_movements) │
└─────────────────────────────────────────┘
```

### Flux d'une requête
1. **Client** envoie une requête HTTP au serveur
2. **Route handler** reçoit la requête
3. **Middleware d'authentification** valide le JWT token
4. **Middleware RBAC** vérifie les permissions
5. **Controller** traite la logique métier
6. **Database layer** exécute les requêtes SQL
7. **Response** retourne les données au client

---

## Spécifications Techniques

### Stack Technologique
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js v5.2.1
- **Base de données**: PostgreSQL 12+
- **Authentification**: JWT (jsonwebtoken v9.0.3)
- **Hachage**: bcrypt v6.0.0
- **Client BD**: pg (node-postgres) v8.18.0
- **Utils**: dotenv v17.2.4

### Structure du Projet
```
backend/
├── src/
│   ├── app.js              # Configuration Express
│   ├── server.js           # Démarrage du serveur
│   ├── db.js               # Connexion BD (deprecated)
│   ├── config/
│   │   └── db.js           # Configuration BD
│   ├── db/                 # Scripts d'initialisation
│   ├── controllers/        # Logique métier
│   ├── routes/             # Définition des endpoints
│   └── middleware/         # Authentification, gestion d'erreurs
├── package.json
├── .env                    # Variables d'environnement
└── .env.example            # Modèle .env
```

### Endpoints API

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

#### Produits
- `GET /api/products` - Lister tous les produits
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (RESPONSABLE)
- `PUT /api/products/:id` - Modifier un produit (RESPONSABLE)
- `DELETE /api/products/:id` - Supprimer un produit (RESPONSABLE)

#### Santé
- `GET /api/health` - Vérification d'état du serveur

### Variables d'Environnement
```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/db_name
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=8h
NODE_ENV=development
```

---

## Contraintes et Limitations

### Données
- Max 160 caractères pour le nom d'un produit
- Max 120 caractères pour la catégorie
- Min 6 caractères pour le mot de passe
- Quantités entières positives uniquement

### Sécurité
- Les tokens JWT expirent après 8h
- Les mots de passe sont hachés avec bcrypt (10 rounds)
- L'email doit être unique

### Performance
- Pas de pagination implémentée (À faire)
- Pas de filtrage sur les produits (À faire)
- Pas de cache implémenté (À faire)

### À implémenter (Phase 2)
- ✋ Mouvements d'inventaire complets
- ✋ Alertes de seuil minimal automatisées
- ✋ Pagination des listes
- ✋ Filtrage par catégorie
- ✋ Dashboard avec statistiques
- ✋ Fichiers logs
- ✋ Tests unitaires et d'intégration
- ✋ Documentation Swagger/OpenAPI
- ✋ Refresh tokens
- ✋ Rate limiting

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| RESPONSABLE | Rôle administrateur avec accès complet |
| EMPLOYE | Rôle utilisateur avec accès lecture seule |
| JWT | JSON Web Token - Format sécurisé pour l'authentification |
| RBAC | Role-Based Access Control - Contrôle d'accès par rôle |
| Schema | Structure des tables en base de données |
| Middleware | Fonction traitant une requête avant le controller |
| Pool | Gestion des connexions BD |
| Enum | Type énuméré restreignant les valeurs possibles |

---

## Version History

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0 | 2026-03-09 | Dev | Document initial |

---

**Document écrit le**: 9 mars 2026  
**Dernier modifié**: 9 mars 2026
