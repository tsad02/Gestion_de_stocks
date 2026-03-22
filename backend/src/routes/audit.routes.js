const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const verifyToken = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par token et limitées aux Responsables
router.use(verifyToken);
router.use(roleMiddleware(['RESPONSABLE']));

router.get('/', auditController.getAuditLogs);

module.exports = router;
