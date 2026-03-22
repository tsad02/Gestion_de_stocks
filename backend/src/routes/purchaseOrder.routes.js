const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// Routes protégées
router.use(authenticate);

// Liste et création
router.get('/', purchaseOrderController.list);
router.post('/', purchaseOrderController.create);
router.post('/auto', purchaseOrderController.autoCreate);

// Actions spécifiques
router.get('/:id', purchaseOrderController.getById);
router.put('/:id', purchaseOrderController.update);
router.delete('/:id', authorize('RESPONSABLE'), purchaseOrderController.delete);

module.exports = router;
