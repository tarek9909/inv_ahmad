const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const commonTimestamps = {
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
};

const Role = sequelize.define('roles', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: DataTypes.TEXT,
  ...commonTimestamps
}, { tableName: 'roles', timestamps: false });

const User = sequelize.define('users', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  role_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  phone: DataTypes.STRING(50),
  password: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive', 'blocked'), defaultValue: 'active' },
  last_login_at: DataTypes.DATE,
  ...commonTimestamps
}, {
  tableName: 'users',
  timestamps: false,
  defaultScope: { attributes: { exclude: ['password'] } },
  scopes: { withPassword: { attributes: {} } }
});

const Supplier = sequelize.define('suppliers', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  phone: DataTypes.STRING(50),
  email: DataTypes.STRING(150),
  address: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  created_by: DataTypes.BIGINT.UNSIGNED,
  ...commonTimestamps
}, { tableName: 'suppliers', timestamps: false });

const ItemCategory = sequelize.define('item_categories', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  ...commonTimestamps
}, { tableName: 'item_categories', timestamps: false });

const Item = sequelize.define('items', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  category_id: DataTypes.BIGINT.UNSIGNED,
  supplier_id: DataTypes.BIGINT.UNSIGNED,
  name: { type: DataTypes.STRING(150), allowNull: false },
  sku: { type: DataTypes.STRING(100), unique: true },
  description: DataTypes.TEXT,
  unit: { type: DataTypes.STRING(50), defaultValue: 'piece' },
  purchase_price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  selling_price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  current_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  minimum_stock: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  created_by: DataTypes.BIGINT.UNSIGNED,
  ...commonTimestamps
}, { tableName: 'items', timestamps: false });

const StockEntry = sequelize.define('stock_entries', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  supplier_id: DataTypes.BIGINT.UNSIGNED,
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  unit_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_cost: { type: DataTypes.VIRTUAL, get() { return Number(this.quantity || 0) * Number(this.unit_cost || 0); } },
  entry_date: { type: DataTypes.DATEONLY, allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.BIGINT.UNSIGNED,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'stock_entries', timestamps: false });

const StockMovement = sequelize.define('stock_movements', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  movement_type: {
    type: DataTypes.ENUM('stock_in', 'stock_out', 'adjustment_in', 'adjustment_out', 'purchase_received', 'driver_request', 'driver_return', 'cancelled_request'),
    allowNull: false
  },
  reference_type: DataTypes.STRING(100),
  reference_id: DataTypes.BIGINT.UNSIGNED,
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stock_before: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  stock_after: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  notes: DataTypes.TEXT,
  created_by: DataTypes.BIGINT.UNSIGNED,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'stock_movements', timestamps: false });

const PurchaseOrder = sequelize.define('purchase_orders', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  po_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  supplier_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  order_date: { type: DataTypes.DATEONLY, allowNull: false },
  expected_delivery_date: DataTypes.DATEONLY,
  received_date: DataTypes.DATEONLY,
  status: { type: DataTypes.ENUM('draft', 'pending', 'partially_received', 'received', 'cancelled'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  tax_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  notes: DataTypes.TEXT,
  created_by: DataTypes.BIGINT.UNSIGNED,
  approved_by: DataTypes.BIGINT.UNSIGNED,
  ...commonTimestamps
}, { tableName: 'purchase_orders', timestamps: false });

const PurchaseOrderItem = sequelize.define('purchase_order_items', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  purchase_order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  ordered_quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  received_quantity: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  unit_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_cost: { type: DataTypes.VIRTUAL, get() { return Number(this.ordered_quantity || 0) * Number(this.unit_cost || 0); } },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'purchase_order_items', timestamps: false });

const Driver = sequelize.define('drivers', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(150), allowNull: false },
  phone: DataTypes.STRING(50),
  address: DataTypes.TEXT,
  id_number: DataTypes.STRING(100),
  vehicle_type: DataTypes.STRING(100),
  vehicle_plate_number: DataTypes.STRING(100),
  notes: DataTypes.TEXT,
  status: { type: DataTypes.ENUM('active', 'inactive', 'blocked'), defaultValue: 'active' },
  created_by: DataTypes.BIGINT.UNSIGNED,
  updated_by: DataTypes.BIGINT.UNSIGNED,
  ...commonTimestamps
}, { tableName: 'drivers', timestamps: false });

const StockRequest = sequelize.define('stock_requests', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  request_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  driver_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  request_date: { type: DataTypes.DATEONLY, allowNull: false },
  request_type: { type: DataTypes.ENUM('stock_out', 'stock_return'), defaultValue: 'stock_out' },
  request_status: { type: DataTypes.ENUM('draft', 'pending', 'approved', 'completed', 'cancelled'), defaultValue: 'pending' },
  payment_status: { type: DataTypes.ENUM('pending', 'partially_paid', 'paid', 'cancelled'), defaultValue: 'pending' },
  subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  total_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  paid_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  remaining_amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  notes: DataTypes.TEXT,
  created_by: DataTypes.BIGINT.UNSIGNED,
  approved_by: DataTypes.BIGINT.UNSIGNED,
  completed_by: DataTypes.BIGINT.UNSIGNED,
  paid_by: DataTypes.BIGINT.UNSIGNED,
  approved_at: DataTypes.DATE,
  completed_at: DataTypes.DATE,
  paid_at: DataTypes.DATE,
  ...commonTimestamps
}, { tableName: 'stock_requests', timestamps: false });

const StockRequestItem = sequelize.define('stock_request_items', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  stock_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  item_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  quantity: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  unit_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  total_price: { type: DataTypes.VIRTUAL, get() { return Number(this.quantity || 0) * Number(this.unit_price || 0); } },
  notes: DataTypes.TEXT,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'stock_request_items', timestamps: false });

const Payment = sequelize.define('payments', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  stock_request_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  driver_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  payment_number: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  payment_method: { type: DataTypes.ENUM('cash', 'bank_transfer', 'other'), defaultValue: 'cash' },
  payment_date: { type: DataTypes.DATE, allowNull: false },
  notes: DataTypes.TEXT,
  received_by: DataTypes.BIGINT.UNSIGNED,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'payments', timestamps: false });

const AuditLog = sequelize.define('audit_logs', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.BIGINT.UNSIGNED,
  action: { type: DataTypes.STRING(150), allowNull: false },
  module: { type: DataTypes.STRING(100), allowNull: false },
  record_id: DataTypes.BIGINT.UNSIGNED,
  old_data: DataTypes.JSON,
  new_data: DataTypes.JSON,
  ip_address: DataTypes.STRING(100),
  user_agent: DataTypes.TEXT,
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'audit_logs', timestamps: false });

Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Supplier.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ItemCategory.hasMany(Item, { foreignKey: 'category_id', as: 'items' });
Item.belongsTo(ItemCategory, { foreignKey: 'category_id', as: 'category' });
Supplier.hasMany(Item, { foreignKey: 'supplier_id', as: 'items' });
Item.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Item.hasMany(StockEntry, { foreignKey: 'item_id', as: 'stock_entries' });
StockEntry.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });
Supplier.hasMany(StockEntry, { foreignKey: 'supplier_id', as: 'stock_entries' });
StockEntry.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Item.hasMany(StockMovement, { foreignKey: 'item_id', as: 'stock_movements' });
StockMovement.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchase_orders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchase_order' });
PurchaseOrderItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

Driver.hasMany(StockRequest, { foreignKey: 'driver_id', as: 'stock_requests' });
StockRequest.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });
StockRequest.hasMany(StockRequestItem, { foreignKey: 'stock_request_id', as: 'items' });
StockRequestItem.belongsTo(StockRequest, { foreignKey: 'stock_request_id', as: 'stock_request' });
StockRequestItem.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

StockRequest.hasMany(Payment, { foreignKey: 'stock_request_id', as: 'payments' });
Payment.belongsTo(StockRequest, { foreignKey: 'stock_request_id', as: 'stock_request' });
Driver.hasMany(Payment, { foreignKey: 'driver_id', as: 'payments' });
Payment.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Role,
  User,
  Supplier,
  ItemCategory,
  Item,
  StockEntry,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  Driver,
  StockRequest,
  StockRequestItem,
  Payment,
  AuditLog
};
