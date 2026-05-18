const router = require('express').Router();
const controller = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

const inventoryOnly = [authenticate, authorize('inventory')];
const adminOnly = [authenticate, authorize('admin')];

router.get('/categories', ...inventoryOnly, validate(schemas.pagination, 'query'), controller.categories.list);
router.post('/categories', ...inventoryOnly, validate(schemas.category), controller.categories.create);
router.patch('/categories/:id', ...inventoryOnly, validate(schemas.categoryUpdate), controller.categories.update);
router.delete('/categories/:id', ...adminOnly, controller.deleteCategory);

router.get('/suppliers', ...inventoryOnly, validate(schemas.pagination, 'query'), controller.suppliers.list);
router.post('/suppliers', ...inventoryOnly, validate(schemas.supplier), controller.suppliers.create);
router.patch('/suppliers/:id', ...inventoryOnly, validate(schemas.supplierUpdate), controller.suppliers.update);
router.delete('/suppliers/:id', ...adminOnly, controller.deleteSupplier);

router.get('/items/low-stock', ...inventoryOnly, controller.lowStockItems);
router.get('/items', ...inventoryOnly, validate(schemas.pagination, 'query'), controller.items.list);
router.post('/items', ...inventoryOnly, validate(schemas.itemCreate), controller.items.create);
router.patch('/items/:id', ...inventoryOnly, validate(schemas.itemUpdate), controller.items.update);
router.delete('/items/:id', ...adminOnly, controller.deleteItem);

router.post('/stock-entries', ...inventoryOnly, validate(schemas.stockEntry), controller.addStockEntry);
router.post('/stock-adjustments', ...inventoryOnly, validate(schemas.stockAdjustment), controller.adjustStock);
router.get('/stock-movements', ...inventoryOnly, validate(schemas.pagination, 'query'), controller.listStockMovements);

router.get('/purchase-orders', ...inventoryOnly, validate(schemas.pagination, 'query'), controller.listPurchaseOrders);
router.post('/purchase-orders', ...inventoryOnly, validate(schemas.purchaseOrderCreate), controller.createPurchaseOrder);
router.get('/purchase-orders/:id', ...inventoryOnly, controller.getPurchaseOrder);
router.patch('/purchase-orders/:id', ...inventoryOnly, validate(schemas.purchaseOrderUpdate), controller.updatePurchaseOrder);
router.post('/purchase-orders/:id/receive', ...inventoryOnly, validate(schemas.receivePurchaseOrder), controller.receivePurchaseOrder);
router.post('/purchase-orders/:id/cancel', ...inventoryOnly, controller.cancelPurchaseOrder);

module.exports = router;
