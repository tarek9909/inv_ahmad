const { fn, col } = require('sequelize');
const { Driver, DriverUserLink, StockRequest, Payment } = require('../models');
const { list, findOrFail } = require('../services/crudService');
const stockRequestService = require('../services/stockRequestService');
const paymentService = require('../services/paymentService');
const { logAction } = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/responses');
const HttpError = require('../utils/httpError');

exports.listDrivers = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(Driver, req.query, { include: [{ model: DriverUserLink, as: 'user_link' }], searchFields: ['full_name', 'phone', 'id_number', 'vehicle_plate_number'] });
  rows.forEach((driver) => driver.setDataValue('user_id', driver.user_link?.user_id || null));
  ok(res, 'Drivers loaded', rows, meta);
});

exports.createDriver = asyncHandler(async (req, res) => {
  const { user_id, ...payload } = req.body;
  const driver = await Driver.create({ ...payload, created_by: req.user.id });
  if (user_id) await DriverUserLink.create({ driver_id: driver.id, user_id });
  await logAction({ req, action: 'create', module: 'drivers', recordId: driver.id, newData: driver.toJSON() });
  driver.setDataValue('user_id', user_id || null);
  created(res, 'Driver created', driver);
});

exports.updateDriver = asyncHandler(async (req, res) => {
  const driver = await findOrFail(Driver, req.params.id, { name: 'Driver' });
  const { user_id, ...payload } = req.body;
  const oldData = driver.toJSON();
  await driver.update({ ...payload, updated_by: req.user.id });
  await DriverUserLink.destroy({ where: { driver_id: driver.id } });
  if (user_id) await DriverUserLink.create({ driver_id: driver.id, user_id });
  driver.setDataValue('user_id', user_id || null);
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

exports.acceptStockRequest = asyncHandler(async (req, res) => {
  const request = await stockRequestService.acceptStockRequest(req.params.id, req);
  ok(res, 'Stock request accepted', request);
});

exports.cancelStockRequest = asyncHandler(async (req, res) => {
  const request = await stockRequestService.cancelStockRequest(req.params.id, req);
  ok(res, 'Stock request cancelled', request);
});

exports.printStockRequest = asyncHandler(async (req, res) => {
  const result = await stockRequestService.recordStockRequestPrint(req.params.id, req.body || {}, req);
  ok(res, 'Stock request print recorded', result);
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
