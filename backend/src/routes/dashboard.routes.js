const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { dashboardAccess } = require('../middleware/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');

/**
 * GET /api/dashboard/summary
 * Récupère un résumé complet du dashboard
 * Accessible à : EMPLOYE, RESPONSABLE
 */
router.get('/summary', verifyToken, dashboardAccess('EMPLOYE', 'RESPONSABLE'), dashboardController.getDashboardSummary);

/**
 * GET /api/dashboard/stats
 * Récupère les statistiques détaillées par jour
 * Paramètres : ?days=30 (par défaut)
 */
router.get('/stats', verifyToken, dashboardAccess('EMPLOYE', 'RESPONSABLE'), dashboardController.getDashboardStats);

module.exports = router;
