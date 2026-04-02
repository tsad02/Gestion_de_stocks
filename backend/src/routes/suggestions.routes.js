const express = require('express');
const router = express.Router();

/**
 * Routes pour le moteur de suggestions (aide à la décision).
 * Nécessite une authentification utilisateur.
 */
const { getSuggestions } = require('../controllers/suggestions.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route   GET /api/suggestions
 * @desc    Récupère la liste des recommandations et alertes intelligentes
 * @access  Privé
 */
router.get('/', authMiddleware, getSuggestions);

module.exports = router;
