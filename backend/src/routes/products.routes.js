const router = require("express").Router();
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/products.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

/**
 * Routes de gestion des produits
 * Préfixe : /api/products
 * 
 * Toutes ces routes nécessitent d'être connecté (authMiddleware)
 */
router.use(authMiddleware);

// --- Routes de Consultation (Ouvertes à EMPLOYE et RESPONSABLE) ---

// Lister tous les produits
router.get("/", authorize("EMPLOYE", "RESPONSABLE"), getProducts);

// Voir les détails d'un produit spécifique
router.get("/:id", authorize("EMPLOYE", "RESPONSABLE"), getProductById);


// --- Routes de Gestion (Réservées au RESPONSABLE uniquement) ---

// Ajouter un nouveau produit
router.post("/", authorize("RESPONSABLE"), addProduct);

// Modifier un produit ou mettre à jour le stock
router.put("/:id", authorize("RESPONSABLE"), updateProduct);

// Supprimer un produit
router.delete("/:id", authorize("RESPONSABLE"), deleteProduct);

module.exports = router;