const router = require("express").Router();
const { registerUser, loginUser, getAllUsers, getMe, updateMe } = require("../controllers/auth.controllers");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

/**
 * Routes de gestion de l'authentification
 * Préfixe : /api/auth
 */

// Connexion d'un utilisateur existant (public)
// POST /api/auth/login
router.post("/login", loginUser);

// Profil de l'utilisateur connecté
// GET /api/auth/me
router.get("/me", authenticate, getMe);

// Mise à jour du profil de l'utilisateur connecté
// PUT /api/auth/me
router.put("/me", authenticate, updateMe);

// Inscription d'un nouvel utilisateur (protégée - RESPONSABLE uniquement)
// POST /api/auth/register
router.post("/register", authenticate, authorize("RESPONSABLE"), registerUser);

// Récupère la liste de tous les utilisateurs (protégée - RESPONSABLE uniquement)
// GET /api/auth/users
router.get("/users", authenticate, authorize("RESPONSABLE"), getAllUsers);

module.exports = router;