const { fn, col } = require('sequelize');
const { Driver, StockRequest, Payment } = require('../models');
const { list, findOrFail } = require('../services/crudService');
const stockRequestService = require('../services/stockRequestService');
const paymentService = require('../services/paymentService');
const { logAction } = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/responses');
const HttpError = require('../utils/httpError');

exports.listDrivers = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(Driver, req.query, { searchFields: ['full_name', 'phone', 'id_number', 'vehicle_plate_number'] });
  ok(res, 'Drivers loaded', rows, meta);
});

exports.createDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.create({ ...req.body, created_by: req.user.id });
  await logAction({ req, action: 'create', module: 'drivers', recordId: driver.id, newData: driver.toJSON() });
  created(res, 'Driver created', driver);
});

exports.updateDriver = asyncHandler(async (req, res) => {
  const driver = await findOrFail(Driver, req.params.id, { name: 'Driver' });
  const oldData = driver.toJSON();
  await driver.update({ ...req.body, updated_by: req.user.id });
  await logAction({ req, action: 'update', module: 'drivers', recordId: driver.id, oldData, newData: driver.toJSON() });
  ok(res, 'Driver updated', driver);
});

exports.updateDriverStatus = asyncHandler(async (req, res) => {
  const driver = await findOrFail(Driver, req.params.id, { name: 'Driver' });
  const oldData = driver.toJSON();
  await driver.update({ status: req.body.status, updated_by: req.user.id });
  await logAction({ req, action: 'status', module: 'drivers', recordId: driver.id, oldData, newData: driver.toJSON() });
  ok(res, 'Driver status updated', driver);
});

exports.driverBalance = asyncHandler(async (req, res) => {
  const driver = await findOrFail(Driver, req.params.id, { name: 'Driver' });
  const balance = await StockRequest.sum('remaining_amount', { where: { driver_id: driver.id } });
  ok(res, 'Driver balance loaded', { driver, balance: Number(balance || 0) });
});

exports.listStockRequests = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(StockRequest, req.query, { include: stockRequestService.includeStockRequest, searchFields: ['request_number', 'request_status', 'payment_status'] });
  ok(res, 'Stock requests loaded', rows, meta);
});

exports.getStockRequest = asyncHandler(async (req, res) => {
  const request = await findOrFail(StockRequest, req.params.id, { name: 'Stock request', include: stockRequestService.includeStockRequest });
  ok(res, 'Stock request loaded', request);
});

exports.createStockRequest = asyncHandler(async (req, res) => {
  const request = await stockRequestService.createStockRequest(req.body, req);
  created(res, 'Stock request created', request);
});

exports.updateStockRequest = asyncHandler(async (req, res) => {
  const request = await findOrFail(StockRequest, req.params.id, { name: 'Stock request' });
  const oldData = request.toJSON();
  await request.update(req.body);
  await logAction({ req, action: 'update', module: 'stock_requests', recordId: request.id, oldData, newData: request.toJSON() });
  ok(res, 'Stock request updated', request);
});

exports.completeStockRequest = asyncHandler(async (req, res) => {
  const request = await stockRequestService.completeStockRequest(req.params.id, req);
  ok(res, 'Stock request completed', request);
});

exports.cancelStockRequest = asyncHandler(async (req, res) => {
  const request = await stockRequestService.cancelStockRequest(req.params.id, req);
  ok(res, 'Stock request cancelled', request);
});

exports.listPayments = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(Payment, req.query, { include: paymentService.includePayment, searchFields: ['payment_number', 'payment_method'] });
  ok(res, 'Payments loaded', rows, meta);
});

exports.createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req);
  created(res, 'Payment created', payment);
});

exports.deleteDriver = asyncHandler(async (req, res) => {
  const driver = await findOrFail(Driver, req.params.id, { name: 'Driver' });
  const stockRequests = await StockRequest.count({ where: { driver_id: driver.id } });
  const payments = await Payment.count({ where: { driver_id: driver.id } });
  if (stockRequests > 0 || payments > 0) {
    throw new HttpError(409, 'Driver has related records and cannot be permanently deleted');
  }
  const oldData = driver.toJSON();
  await driver.destroy();
  await logAction({ req, action: 'delete', module: 'drivers', recordId: driver.id, oldData });
  ok(res, 'Driver permanently deleted');
});
