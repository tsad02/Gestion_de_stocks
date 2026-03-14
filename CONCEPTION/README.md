# 📐 CONCEPTION TECHNIQUE – Gestion de Stocks

Bienvenue dans le dossier de **conception technique complète** du projet. Vous y trouverez tous les diagrammes UML et les spécifications de la base de données.

---

## 📑 Index des Documents

### 1. **[ERD – Tables & Relations](./01_ERD_Tables_Relations.md)**
   - Diagramme Entité-Relation (ER)
   - Détail des tables
   - Relations et contraintes
   - Indices et performances

### 2. **[Diagramme de Cas d'Utilisation](./02_Diagramme_Cas_Utilisation.md)**
   - Acteurs principaux (RESPONSABLE, EMPLOYE)
   - Scénarios d'utilisation
   - Portée du système

### 3. **[Diagramme de Classes](./03_Diagramme_Classes.md)**
   - Architecture logique
   - Entités métier
   - Relations entre classes

### 4. **[Diagrammes de Séquence](./04_Diagrammes_Sequence.md)**
   - Authentification (Login)
   - Gestion des produits (CRUD)
   - Mouvements de stock
   - Calcul des alertes

---

## 🎯 Vue d'Ensemble

```
┌─────────────────────────────────────────────┐
│        CLIENT (React / Postman)             │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│     API REST Express.js (Node.js)           │
│  ├─ Routes                                  │
│  ├─ Controllers                             │
│  └─ Middleware (JWT, RBAC, Validation)     │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│   PostgreSQL Database                       │
│  ├─ Tables (users, products, movements)    │
│  ├─ Vues (stock, alertes, KPI)             │
│  └─ Indices (performance)                   │
└─────────────────────────────────────────────┘
```

---

## 🔑 Entités Principales

### **USERS** (Utilisateurs)
- Authentification via JWT + bcrypt
- Deux rôles : **RESPONSABLE** (admin) et **EMPLOYE** (lecture)

### **PRODUCTS** (Produits)
- Catalogue des produits
- Catégories et unités de mesure
- Seuils d'alerte

### **INVENTORY_MOVEMENTS** (Mouvements de Stock)
- Historique complet des mouvements
- Types : ENTREE, SORTIE, PERTE
- Traçabilité utilisateur et timestamp

---

## 🎨 Outils de Visualisation

Tous les diagrammes utilisent **Mermaid.js**, compatible avec :
- ✅ GitHub (markdown preview)
- ✅ VS Code (extension Mermaid Preview)
- ✅ GitLab
- ✅ Notion
- ✅ Confluence

**Pour afficher les diagrammes** :
1. Ouvrir le fichier `.md` dans VS Code
2. Installer l'extension **Markdown Preview Mermaid Support** (si non présente)
3. Aperçu instantané côté-à-côté (Ctrl+Shift+V)

---

## 📋 Conventions

### Nommage des Tables
- PascalCase en CamelCase : `ProductMovement` → `product_movements`

### Nommage des Colonnes
- snake_case : `User` → `user_id`
- IDs au format : `[table]_id` (ex: `product_id`)

### Énumérés
- UPPERCASE : `RESPONSABLE`, `EMPLOYE`, `ENTREE`, `SORTIE`, `PERTE`

### Timestamps
- Format ISO 8601 : `TIMESTAMP DEFAULT NOW()`

---

## 🔄 Flux Métier Principal

```
1. Utilisateur se connecte
    ↓
2. Systématise crée JWT
    ↓
3. Utilisateur récupère produits (lecture)
    ↓
4. RESPONSABLE ajoute/modifie mouvement de stock
    ↓
5. Système recalcule stock_actuel (via vue)
    ↓
6. Alertes générées si stock ≤ seuil
    ↓
7. Dashboard affiche KPI
```

---

## 📖 Lectures Recommandées

1. Commencer par **ERD – Tables & Relations** (structure de base)
2. Consulter **Diagramme de Cas d'Utilisation** (portée fonctionnelle)
3. Examiner **Diagramme de Classes** (architecture logique)
4. Analyser **Diagrammes de Séquence** (interactions dynamiques)

---

## ✅ Statut de Complétude

| Document | Status |
|----------|--------|
| ERD & Tables | ✅ COMPLET |
| Cas d'Utilisation | ✅ COMPLET |
| Diagramme de Classes | ✅ COMPLET |
| Diagrammes de Séquence | ✅ COMPLET |

---

**Dernière mise à jour : 11/03/2026**  
**Version : 1.0 - STABLE**
