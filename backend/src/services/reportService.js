const { Op, fn, col, literal } = require('sequelize');
const { Item, Driver, StockRequest, Payment, PurchaseOrder } = require('../models');

const dashboard = async () => ({
  total_items: await Item.count(),
  low_stock_items: await Item.count({ where: { [Op.and]: [literal('current_stock <= minimum_stock')] } }),
  active_drivers: await Driver.count({ where: { status: 'active' } }),
  pending_stock_requests: await StockRequest.count({ where: { request_status: 'pending' } }),
  unpaid_requests: await StockRequest.count({ where: { payment_status: { [Op.in]: ['pending', 'partially_paid'] } } })
});

const inventorySummary = async () => Item.findAll({
  attributes: ['id', 'name', 'sku', 'unit', 'current_stock', 'minimum_stock', 'purchase_price', 'selling_price', 'status'],
  order: [['name', 'ASC']]
});

const driverBalances = async () => Driver.findAll({
  attributes: [
    'id',
    'full_name',
    'phone',
    'status',
    [fn('COALESCE', fn('SUM', col('stock_requests.remaining_amount')), 0), 'balance']
  ],
  include: [{ model: StockRequest, as: 'stock_requests', attributes: [] }],
  group: ['drivers.id'],
  order: [['full_name', 'ASC']]
});

const paymentSummary = async () => Payment.findAll({
  attributes: [
    [fn('DATE', col('payment_date')), 'date'],
    [fn('SUM', col('amount')), 'amount']
  ],
  group: [fn('DATE', col('payment_date'))],
  order: [[fn('DATE', col('payment_date')), 'DESC']]
});

const purchaseSummary = async () => PurchaseOrder.findAll({
  attributes: ['status', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('total_amount')), 'amount']],
  group: ['status']
});

module.exports = { dashboard, inventorySummary, driverBalances, paymentSummary, purchaseSummary };
