const router = require('express').Router();
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const driverController = require('../controllers/driverController');

router.get('/me', authenticate, requirePermission('driver_portal.view'), driverController.me);
router.get('/stock-requests', authenticate, requirePermission('driver_portal.view'), driverController.listStockRequests);
router.get('/stock-requests/:id', authenticate, requirePermission('driver_portal.view'), driverController.getStockRequest);

module.exports = router;
