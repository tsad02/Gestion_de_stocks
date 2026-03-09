const router = require("express").Router();
const { registerUser, loginUser } = require("../controllers/auth.controllers");

/**
 * Routes de gestion de l'authentification
 * Préfixe : /api/auth
 */

// Inscription d'un nouvel utilisateur
// POST /api/auth/register
router.post("/register", registerUser);

// Connexion d'un utilisateur existant
// POST /api/auth/login
router.post("/login", loginUser);

module.exports = router;