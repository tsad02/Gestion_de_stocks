# Documentation API - Dashboard Semaine 8

## 🔌 Endpoint: GET /api/dashboard/summary

### Description
Récupère toutes les données nécessaires pour afficher le Dashboard complet.

### Authentification
- **Méthode**: Bearer Token
- **Header**: `Authorization: Bearer <TOKEN>`
- **Rôles autorisés**: EMPLOYE, RESPONSABLE

### Requête
```bash
GET /api/dashboard/summary
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Réponse - Succès (200 OK)
```json
{
  "status": "success",
  "timestamp": "2026-03-14T14:35:22.000Z",
  "data": {
    "summary": {
      "total_produits": 15,
      "produits_en_alerte": 3,
      "produits_rupture": 0,
      "stock_total": 450,
      "stock_moyen": 30.0
    },
    "critical_products": [
      {
        "product_id": 2,
        "name": "Frites Surgelées",
        "category": "Surgelés",
        "unit": "kg",
        "stock": 2,
        "threshold": 10,
        "needed": 8,
        "alert_level": "CRITICAL"
      },
      {
        "product_id": 5,
        "name": "Café Moulu",
        "category": "Boissons",
        "unit": "kg",
        "stock": 8,
        "threshold": 12,
        "needed": 4,
        "alert_level": "WARNING"
      }
    ],
    "movements_7days": {
      "entries": {
        "count": 5,
        "quantity": 120
      },
      "exits": {
        "count": 8,
        "quantity": 95
      },
      "losses": {
        "count": 1,
        "quantity": 2
      }
    },
    "recent_movements": [
      {
        "id": 42,
        "type": "SORTIE",
        "quantity": 15,
        "product_name": "Poulet Rôti",
        "category": "Viandes",
        "created_by": "Marie Dupont",
        "reason": null,
        "created_at": "2026-03-14T14:30:00Z"
      },
      {
        "id": 41,
        "type": "ENTREE",
        "quantity": 50,
        "product_name": "Frites",
        "category": "Surgelés",
        "created_by": "Jean Martin",
        "reason": null,
        "created_at": "2026-03-14T10:15:00Z"
      },
      {
        "id": 40,
        "type": "PERTE",
        "quantity": 2,
        "product_name": "Muffin Chocolat",
        "category": "Pâtisserie",
        "created_by": "Sophie Chen",
        "reason": "Produit expiré",
        "created_at": "2026-03-13T18:45:00Z"
      }
    ],
    "top_consumption": [
      {
        "product_id": 1,
        "name": "Poulet Rôti",
        "category": "Viandes",
        "total_consumption": 120,
        "total_entries": 150,
        "total_losses": 5
      },
      {
        "product_id": 3,
        "name": "Café",
        "category": "Boissons",
        "total_consumption": 85,
        "total_entries": 100,
        "total_losses": 2
      }
    ],
    "movements_by_day": [
      {
        "date": "2026-03-14",
        "type": "ENTREE",
        "quantity": 50,
        "count": 2
      },
      {
        "date": "2026-03-14",
        "type": "SORTIE",
        "quantity": 45,
        "count": 3
      },
      {
        "date": "2026-03-13",
        "type": "ENTREE",
        "quantity": 70,
        "count": 2
      },
      {
        "date": "2026-03-13",
        "type": "SORTIE",
        "quantity": 50,
        "count": 5
      }
    ]
  }
}
```

### Réponse - Erreur (401 Unauthorized)
```json
{
  "status": "error",
  "error": "Authentification requise",
  "details": "Token manquant ou invalide"
}
```

### Réponse - Erreur (403 Forbidden)
```json
{
  "status": "error",
  "error": "Accès refusé",
  "details": "Vos permissions ne permettent pas d'accéder à cette ressource"
}
```

### Réponse - Erreur (500 Internal Server Error)
```json
{
  "status": "error",
  "error": "Erreur lors de la récupération du dashboard",
  "details": "Détail technique de l'erreur"
}
```

---

## 🔌 Endpoint: GET /api/dashboard/stats

### Description
Récupère les statistiques détaillées des mouvements sur une période.

### Authentification
- **Méthode**: Bearer Token
- **Header**: `Authorization: Bearer <TOKEN>`
- **Rôles autorisés**: EMPLOYE, RESPONSABLE

### Requête
```bash
GET /api/dashboard/stats?days=30
Authorization: Bearer <TOKEN>
```

### Paramètres
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| days | number | Non | Nombre de jours (défaut: 30) |

### Réponse - Succès (200 OK)
```json
{
  "status": "success",
  "data": [
    {
      "date": "2026-03-14",
      "type": "ENTREE",
      "quantity": 50,
      "count": 2
    },
    {
      "date": "2026-03-14",
      "type": "SORTIE",
      "quantity": 45,
      "count": 3
    },
    {
      "date": "2026-03-13",
      "type": "ENTREE",
      "quantity": 70,
      "count": 2
    }
  ]
}
```

---

## 📊 Schémas de Données

### Summary (Résumé Global)
```typescript
{
  total_produits: number        // Nombre total de produits
  produits_en_alerte: number    // Produits avec stock <= seuil
  produits_rupture: number      // Produits avec stock = 0
  stock_total: number           // Somme des stocks actuels
  stock_moyen: number           // Moyenne de stock par produit
}
```

### CriticalProduct (Produit Critique)
```typescript
{
  product_id: number            // ID du produit
  name: string                  // Nom du produit
  category: string              // Catégorie
  unit: string                  // Unité (kg, pcs, L, etc)
  stock: number                 // Stock actuel
  threshold: number             // Seuil minimal
  needed: number                // Quantité à commander (threshold - stock)
  alert_level: 'CRITICAL' | 'WARNING'  // Niveau d'alerte
}
```

### Movement (Mouvement Récent)
```typescript
{
  id: number                    // ID du mouvement
  type: 'ENTREE' | 'SORTIE' | 'PERTE'
  quantity: number              // Quantité
  product_name: string          // Nom du produit
  category: string              // Catégorie du produit
  created_by: string            // Nom de la personne qui a créé
  reason: string | null         // Motif (optionnel)
  created_at: string            // Date ISO 8601
}
```

### MovementStats (Statistiques 7 jours)
```typescript
{
  entries: {
    count: number               // Nombre de mouvements ENTREE
    quantity: number            // Quantité totale ENTREE
  }
  exits: {
    count: number               // Nombre de mouvements SORTIE
    quantity: number            // Quantité totale SORTIE
  }
  losses: {
    count: number               // Nombre de mouvements PERTE
    quantity: number            // Quantité totale PERTE
  }
}
```

### DailyMovement (Mouvement par jour)
```typescript
{
  date: string                  // Date YYYY-MM-DD
  type: 'ENTREE' | 'SORTIE' | 'PERTE'
  quantity: number              // Quantité totale pour le jour
  count: number                 // Nombre de mouvements pour le jour
}
```

---

## 🔍 Vues SQL (Database)

### vue v_product_stock
Affiche le stock actuel calculé pour chaque produit.

```sql
SELECT
  p.id            AS product_id,
  p.name          AS product_name,
  p.category,
  p.unit,
  p.min_threshold,
  COALESCE(SUM(
    CASE
      WHEN m.type = 'ENTREE' THEN m.quantity
      WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
    END
  ), 0) AS stock_actuel
FROM products p
LEFT JOIN inventory_movements m ON m.product_id = p.id
GROUP BY p.id, p.name, p.category, p.unit, p.min_threshold;
```

### Vue v_alerts_critical_products
Affiche les produits avec stock <= seuil minimal.

```sql
SELECT
  product_id,
  product_name,
  category,
  unit,
  min_threshold,
  stock_actuel
FROM v_product_stock
WHERE stock_actuel <= min_threshold
ORDER BY stock_actuel ASC;
```

---

## 🔄 Flux de Données Détaillé

```
┌─────────────────────┐
│   Frontend React    │
│  Dashboard.jsx      │
└──────────┬──────────┘
           │
           │ appel fetch
           ↓
┌─────────────────────┐
│  dashboardAPI.js    │
│  getSummary()       │
└──────────┬──────────┘
           │
           │ GET /api/dashboard/summary
           │ + Authorization Header
           ↓
┌──────────────────────────────┐
│   Backend - Express.js       │
│   POST /api/dashboard/summary │
│   + verifyToken middleware   │
│   + dashboardAccess middleware│
│   → dashboardController      │
└──────────┬───────────────────┘
           │
           │ Exécution parallèle (Promise.all)
           └───────────┬─────────┬─────────┬─────────┬─────────┐
                       ↓         ↓         ↓         ↓         ↓
                   Query 1   Query 2   Query 3   Query 4   Query 5   Query 6
                 (Stats)   (Critical)(Mov7d)    (Recent)  (Top)     (byDay)
                       │         │         │         │         │         │
                       └─────────┴─────────┴─────────┴─────────┴─────────┘
                               ↓
                    ┌──────────────────────┐
                    │   PostgreSQL BD      │
                    │   Tables +Vues       │
                    └──────────────────────┘
                               ↓
                    (6 résultats)
                               │
           ┌───────────────────┴───────────────────┐
           ↓                                       ↓
      Formatage des données          Retour JSON {status, data}
           │                                       │
           └───────────────────┬───────────────────┘
                               │
                         200 OK Response
                    {
                      "status": "success",
                      "data": { ... }
                    }
                               │
                               ↓
                    ┌─────────────────────┐
                    │  dashboardAPI.js    │
                    │  return response.   │
                    │  data.data          │
                    └────────┬────────────┘
                             │
                             ↓
                    ┌──────────────────────┐
                    │  Dashboard Component │
                    │  setData(result)     │
                    └────────┬─────────────┘
                             │
                             ↓
                    ┌──────────────────────┐
                    │   Render UI          │
                    │  - KPI Cards         │
                    │  - Graphics          │
                    │  - Tables            │
                    └──────────────────────┘
```

---

## 📋 Checklist API Integration

- ✅ Endpoint GET /api/dashboard/summary implémenté
- ✅ Endpoint GET /api/dashboard/stats implémenté
- ✅ Middleware de sécurité appliqué (verifyToken)
- ✅ Middleware de rôle appliqué (dashboardAccess)
- ✅ Requêtes SQL optimisées (Promise.all)
- ✅ Gestion des erreurs complète
- ✅ Réponses JSON cohérentes
- ✅ Données correctement formatées
- ✅ Frontend compatible avec les réponses
- ✅ Tests manuels validés

---

## 🧪 Exemples de Requêtes cURL

### Récupérer le Dashboard
```bash
curl -X GET http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Récupérer les stats 30 jours
```bash
curl -X GET "http://localhost:5000/api/dashboard/stats?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Récupérer les stats 7 jours
```bash
curl -X GET "http://localhost:5000/api/dashboard/stats?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 🚀 Performance API

| Requête | Temps Moyen | Notes |
|---------|------------|-------|
| GET /dashboard/summary | 200-400ms | 6 requêtes SQL parallèles |
| GET /dashboard/stats (7j) | 100-150ms | Agrégation simple |
| GET /dashboard/stats (30j) | 150-250ms | Données plus volumineuses |

---

## 📱 Intégration Frontend

Tous les composants récupèrent les données via `dashboardAPI.getSummary()`:

- `Dashboard.jsx` - Composant principal
- `KPICard.jsx` - Affichage des KPI
- `CriticalProducts.jsx` - Liste des produits critiques
- `MovementStats.jsx` - Graphique des mouvements
- `RecentMovements.jsx` - Tableau des mouvements

---

**API Dashboard - Semaine 8 ✅ COMPLÉTÉ**
