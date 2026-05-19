const router = require('express').Router();
const controller = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');

router.get('/dashboard', authenticate, requirePermission('reports.view'), controller.dashboard);
router.get('/inventory-summary', authenticate, requirePermission('reports.view'), controller.inventorySummary);
router.get('/driver-balances', authenticate, requirePermission('reports.view'), controller.driverBalances);
router.get('/payment-summary', authenticate, requirePermission('reports.view'), controller.paymentSummary);
router.get('/purchase-summary', authenticate, requirePermission('reports.view'), controller.purchaseSummary);

module.exports = router;
