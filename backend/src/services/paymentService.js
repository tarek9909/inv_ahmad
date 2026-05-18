const { sequelize, Payment, StockRequest, Driver } = require('../models');
const HttpError = require('../utils/httpError');
const { generateNumber, toMoney } = require('../utils/numbers');
const { logAction } = require('./auditService');

const includePayment = [
  { model: StockRequest, as: 'stock_request' },
  { model: Driver, as: 'driver' }
];

const createPayment = async (payload, req) => sequelize.transaction(async (transaction) => {
  const request = await StockRequest.findByPk(payload.stock_request_id, { transaction, lock: transaction.LOCK.UPDATE });
  if (!request) throw new HttpError(404, 'Stock request not found');
  if (request.payment_status === 'cancelled') throw new HttpError(400, 'Cancelled requests cannot receive payments');

  const paid = Number(request.paid_amount) + Number(payload.amount);
  const total = Number(request.total_amount);
  if (paid > total) throw new HttpError(400, 'Payment amount exceeds remaining balance');

  const payment = await Payment.create({
    stock_request_id: request.id,
    driver_id: request.driver_id,
    payment_number: generateNumber('payment'),
    amount: payload.amount,
    payment_method: payload.payment_method,
    payment_date: payload.payment_date,
    notes: payload.notes,
    received_by: req.user.id
  }, { transaction });

  const remaining = total - paid;
  await request.update({
    paid_amount: toMoney(paid),
    remaining_amount: toMoney(remaining),
    payment_status: remaining === 0 ? 'paid' : paid > 0 ? 'partially_paid' : 'pending',
    paid_by: remaining === 0 ? req.user.id : request.paid_by,
    paid_at: remaining === 0 ? new Date() : request.paid_at
  }, { transaction });

  await logAction({ req, action: 'create', module: 'payments', recordId: payment.id, newData: payment.toJSON(), transaction });
  return Payment.findByPk(payment.id, { include: includePayment, transaction });
});

module.exports = { includePayment, createPayment };
