const { sequelize, StockRequest, StockRequestItem, Driver, Item, StockRequestPrint } = require('../models');
const HttpError = require('../utils/httpError');
const { generateNumber, toMoney } = require('../utils/numbers');
const { changeStock } = require('./stockService');
const { logAction } = require('./auditService');

const includeStockRequest = [
  { model: Driver, as: 'driver' },
  { model: StockRequestItem, as: 'items', include: [{ model: Item, as: 'item' }] }
];

const createStockRequest = async (payload, req) => sequelize.transaction(async (transaction) => {
  const driver = await Driver.findByPk(payload.driver_id, { transaction });
  if (!driver || driver.status !== 'active') throw new HttpError(400, 'Driver is not active');

  const subtotal = payload.items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unit_price), 0);
  const total = subtotal - Number(payload.discount_amount || 0);
  if (total < 0) throw new HttpError(400, 'Total amount cannot be negative');

  const request = await StockRequest.create({
    request_number: generateNumber('stockRequest'),
    driver_id: payload.driver_id,
    request_date: payload.request_date,
    request_type: payload.request_type,
    subtotal: toMoney(subtotal),
    discount_amount: payload.discount_amount || 0,
    total_amount: toMoney(total),
    remaining_amount: toMoney(total),
    notes: payload.notes,
    created_by: req.user.id
  }, { transaction });

  await StockRequestItem.bulkCreate(payload.items.map((item) => ({
    stock_request_id: request.id,
    item_id: item.item_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes
  })), { transaction });

  await logAction({ req, action: 'create', module: 'stock_requests', recordId: request.id, newData: payload, transaction });
  return StockRequest.findByPk(request.id, { include: includeStockRequest, transaction });
});

const completeStockRequest = async (requestId, req) => sequelize.transaction(async (transaction) => {
  const request = await StockRequest.findByPk(requestId, { include: includeStockRequest, transaction, lock: transaction.LOCK.UPDATE });
  if (!request) throw new HttpError(404, 'Stock request not found');
  if (request.request_status === 'completed') throw new HttpError(400, 'Stock request is already completed');
  if (request.request_status === 'cancelled') throw new HttpError(400, 'Cancelled stock requests cannot be completed');
  if (request.request_status !== 'approved') throw new HttpError(400, 'Stock request must be accepted before completion');

  for (const line of request.items) {
    const item = await Item.findByPk(line.item_id, { transaction, lock: transaction.LOCK.UPDATE });
    await changeStock({
      item,
      quantity: line.quantity,
      direction: request.request_type === 'stock_return' ? 'in' : 'out',
      movementType: request.request_type === 'stock_return' ? 'driver_return' : 'driver_request',
      referenceType: 'stock_requests',
      referenceId: request.id,
      notes: `Completed request ${request.request_number}`,
      userId: req.user.id,
      transaction
    });
  }

  const oldData = request.toJSON();
  await request.update({
    request_status: 'completed',
    completed_by: req.user.id,
    completed_at: new Date()
  }, { transaction });

  await logAction({ req, action: 'complete', module: 'stock_requests', recordId: request.id, oldData, newData: request.toJSON(), transaction });
  return StockRequest.findByPk(request.id, { include: includeStockRequest, transaction });
});

const acceptStockRequest = async (requestId, req) => sequelize.transaction(async (transaction) => {
  const request = await StockRequest.findByPk(requestId, { include: includeStockRequest, transaction, lock: transaction.LOCK.UPDATE });
  if (!request) throw new HttpError(404, 'Stock request not found');
  if (!['draft', 'pending'].includes(request.request_status)) throw new HttpError(400, 'Only draft or pending requests can be accepted');

  const oldData = request.toJSON();
  await request.update({
    request_status: 'approved',
    approved_by: req.user.id,
    approved_at: new Date()
  }, { transaction });
  await logAction({ req, action: 'accept', module: 'stock_requests', recordId: request.id, oldData, newData: request.toJSON(), transaction });
  return StockRequest.findByPk(request.id, { include: includeStockRequest, transaction });
});

const recordStockRequestPrint = async (requestId, payload, req) => {
  const request = await StockRequest.findByPk(requestId, { include: includeStockRequest });
  if (!request) throw new HttpError(404, 'Stock request not found');
  if (!['approved', 'completed'].includes(request.request_status)) throw new HttpError(400, 'Only accepted or completed requests can be printed');

  const print = await StockRequestPrint.create({
    stock_request_id: request.id,
    printed_by: req.user.id,
    printer_name: payload.printer_name || null,
    qz_version: payload.qz_version || null,
    status: payload.status === 'failed' ? 'failed' : 'success',
    error_message: payload.error_message || null
  });
  await logAction({ req, action: print.status === 'success' ? 'print' : 'print_failed', module: 'stock_requests', recordId: request.id, newData: print.toJSON() });
  return { request, print };
};

const cancelStockRequest = async (requestId, req) => sequelize.transaction(async (transaction) => {
  const request = await StockRequest.findByPk(requestId, { transaction });
  if (!request) throw new HttpError(404, 'Stock request not found');
  if (request.request_status === 'completed') throw new HttpError(400, 'Completed stock requests cannot be cancelled');

  const oldData = request.toJSON();
  await request.update({ request_status: 'cancelled', payment_status: 'cancelled' }, { transaction });
  await logAction({ req, action: 'cancel', module: 'stock_requests', recordId: request.id, oldData, newData: request.toJSON(), transaction });
  return request;
});

module.exports = { includeStockRequest, createStockRequest, acceptStockRequest, completeStockRequest, cancelStockRequest, recordStockRequestPrint };
