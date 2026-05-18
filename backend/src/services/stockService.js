const { sequelize, Item, StockEntry, StockMovement } = require('../models');
const HttpError = require('../utils/httpError');
const { toMoney } = require('../utils/numbers');
const { logAction } = require('./auditService');

const changeStock = async ({ item, quantity, direction, movementType, referenceType, referenceId, notes, userId, transaction }) => {
  const before = Number(item.current_stock);
  const delta = Number(quantity);
  const after = direction === 'in' ? before + delta : before - delta;

  if (after < 0) throw new HttpError(400, `Insufficient stock for ${item.name}`);

  await item.update({ current_stock: toMoney(after) }, { transaction });
  return StockMovement.create({
    item_id: item.id,
    movement_type: movementType,
    reference_type: referenceType,
    reference_id: referenceId,
    quantity: delta,
    stock_before: toMoney(before),
    stock_after: toMoney(after),
    notes,
    created_by: userId
  }, { transaction });
};

const addStockEntry = async (payload, req) => sequelize.transaction(async (transaction) => {
  const item = await Item.findByPk(payload.item_id, { transaction, lock: transaction.LOCK.UPDATE });
  if (!item) throw new HttpError(404, 'Item not found');

  const entry = await StockEntry.create({
    ...payload,
    created_by: req.user.id
  }, { transaction });

  await changeStock({
    item,
    quantity: payload.quantity,
    direction: 'in',
    movementType: 'stock_in',
    referenceType: 'stock_entries',
    referenceId: entry.id,
    notes: payload.notes,
    userId: req.user.id,
    transaction
  });

  await logAction({ req, action: 'create', module: 'stock_entries', recordId: entry.id, newData: entry.toJSON(), transaction });
  return entry;
});

const adjustStock = async (payload, req) => sequelize.transaction(async (transaction) => {
  const item = await Item.findByPk(payload.item_id, { transaction, lock: transaction.LOCK.UPDATE });
  if (!item) throw new HttpError(404, 'Item not found');

  const direction = payload.adjustment_type === 'adjustment_in' ? 'in' : 'out';
  const movement = await changeStock({
    item,
    quantity: payload.quantity,
    direction,
    movementType: payload.adjustment_type,
    referenceType: 'stock_adjustments',
    referenceId: null,
    notes: payload.notes,
    userId: req.user.id,
    transaction
  });

  await logAction({ req, action: payload.adjustment_type, module: 'stock_movements', recordId: movement.id, newData: movement.toJSON(), transaction });
  return movement;
});

module.exports = { addStockEntry, adjustStock, changeStock };
