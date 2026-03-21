const router = require("express").Router();
const {
  addMovement,
  listMovements,
  getMovementById,
  getMovementsByProduct
} = require("../controllers/inventory.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

/**
 * Routes de gestion des mouvements de stock
 * Préfixe : /api/inventory-movements
 */

// --- Protection globale (require JWT) ---
router.use(authMiddleware);

// --- GET : Lecture autorisée à EMPLOYE et RESPONSABLE ---
router.get("/", authorize("EMPLOYE", "RESPONSABLE"), listMovements);
router.get("/:id", authorize("EMPLOYE", "RESPONSABLE"), getMovementById);
router.get("/product/:product_id", authorize("EMPLOYE", "RESPONSABLE"), getMovementsByProduct);

// --- POST : Autorisé pour EMPLOYE et RESPONSABLE ---
router.post("/", authorize("EMPLOYE", "RESPONSABLE"), addMovement);

module.exports = router;
