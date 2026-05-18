const router = require('express').Router();
const controller = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [authenticate, authorize('admin')];

router.get('/dashboard', ...adminOnly, controller.dashboard);
router.get('/inventory-summary', ...adminOnly, controller.inventorySummary);
router.get('/driver-balances', ...adminOnly, controller.driverBalances);
router.get('/payment-summary', ...adminOnly, controller.paymentSummary);
router.get('/purchase-summary', ...adminOnly, controller.purchaseSummary);

module.exports = router;
