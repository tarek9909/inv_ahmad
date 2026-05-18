const router = require('express').Router();
const controller = require('../controllers/accountantController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

const accountantOnly = [authenticate, authorize('accountant')];
const adminOnly = [authenticate, authorize('admin')];

router.get('/drivers', ...accountantOnly, validate(schemas.pagination, 'query'), controller.listDrivers);
router.post('/drivers', ...accountantOnly, validate(schemas.driverCreate), controller.createDriver);
router.patch('/drivers/:id', ...accountantOnly, validate(schemas.driverUpdate), controller.updateDriver);
router.patch('/drivers/:id/status', ...accountantOnly, validate(schemas.driverStatus), controller.updateDriverStatus);
router.delete('/drivers/:id', ...adminOnly, controller.deleteDriver);
router.get('/drivers/:id/balance', ...accountantOnly, controller.driverBalance);

router.get('/stock-requests', ...accountantOnly, validate(schemas.pagination, 'query'), controller.listStockRequests);
router.post('/stock-requests', ...accountantOnly, validate(schemas.stockRequestCreate), controller.createStockRequest);
router.get('/stock-requests/:id', ...accountantOnly, controller.getStockRequest);
router.patch('/stock-requests/:id', ...accountantOnly, validate(schemas.stockRequestUpdate), controller.updateStockRequest);
router.post('/stock-requests/:id/complete', ...accountantOnly, controller.completeStockRequest);
router.post('/stock-requests/:id/cancel', ...accountantOnly, controller.cancelStockRequest);

router.get('/payments', ...accountantOnly, validate(schemas.pagination, 'query'), controller.listPayments);
router.post('/payments', ...accountantOnly, validate(schemas.paymentCreate), controller.createPayment);

module.exports = router;
