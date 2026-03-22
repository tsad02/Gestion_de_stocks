const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const verifyToken = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Routes protégées par token
router.use(verifyToken);

// Les employés peuvent voir les localisations
router.get('/', locationsController.getLocations);

// Seuls les responsables peuvent modifier les localisations
router.post('/', roleMiddleware(['RESPONSABLE']), locationsController.createLocation);
router.put('/:id', roleMiddleware(['RESPONSABLE']), locationsController.updateLocation);
router.delete('/:id', roleMiddleware(['RESPONSABLE']), locationsController.deleteLocation);

module.exports = router;
