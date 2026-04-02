const express = require('express');
const router = express.Router();

/**
 * Routes pour la génération de rapports périodiques.
 * Toutes les routes nécessitent une authentification.
 */
const { getReport } = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @route   GET /api/reports
 * @desc    Génère un rapport global (entrées, sorties, pertes) sur une période donnée
 * @access  Privé
 */
router.get('/', authMiddleware, getReport);

module.exports = router;
