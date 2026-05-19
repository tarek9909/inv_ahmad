const router = require('express').Router();
const controller = require('../controllers/accountantController');
const authenticate = require('../middleware/auth');
const { requirePermission } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

router.get('/drivers', authenticate, requirePermission('drivers.view'), validate(schemas.pagination, 'query'), controller.listDrivers);
router.post('/drivers', authenticate, requirePermission('drivers.create'), validate(schemas.driverCreate), controller.createDriver);
router.patch('/drivers/:id', authenticate, requirePermission('drivers.update'), validate(schemas.driverUpdate), controller.updateDriver);
router.patch('/drivers/:id/status', authenticate, requirePermission('drivers.archive'), validate(schemas.driverStatus), controller.updateDriverStatus);
router.delete('/drivers/:id', authenticate, requirePermission('drivers.delete'), controller.deleteDriver);
router.get('/drivers/:id/balance', authenticate, requirePermission('drivers.view_balance'), controller.driverBalance);

router.get('/stock-requests', authenticate, requirePermission('stock_requests.view'), validate(schemas.pagination, 'query'), controller.listStockRequests);
router.post('/stock-requests', authenticate, requirePermission('stock_requests.create'), validate(schemas.stockRequestCreate), controller.createStockRequest);
router.get('/stock-requests/:id', authenticate, requirePermission('stock_requests.view'), controller.getStockRequest);
router.patch('/stock-requests/:id', authenticate, requirePermission('stock_requests.update'), validate(schemas.stockRequestUpdate), controller.updateStockRequest);
router.post('/stock-requests/:id/accept', authenticate, requirePermission('stock_requests.accept'), controller.acceptStockRequest);
router.post('/stock-requests/:id/complete', authenticate, requirePermission('stock_requests.complete'), controller.completeStockRequest);
router.post('/stock-requests/:id/cancel', authenticate, requirePermission('stock_requests.cancel'), controller.cancelStockRequest);
router.post('/stock-requests/:id/print', authenticate, requirePermission('stock_requests.print'), controller.printStockRequest);

router.get('/payments', authenticate, requirePermission('payments.view'), validate(schemas.pagination, 'query'), controller.listPayments);
router.post('/payments', authenticate, requirePermission('payments.create'), validate(schemas.paymentCreate), controller.createPayment);

module.exports = router;
