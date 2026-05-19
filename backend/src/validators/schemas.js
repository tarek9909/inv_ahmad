const Joi = require('joi');

const id = Joi.number().integer().positive();
const money = Joi.number().precision(2).min(0);
const qty = Joi.number().precision(2).greater(0);
const status = (...values) => Joi.string().valid(...values);

const pagination = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().allow('', null)
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const profileUpdate = Joi.object({
  full_name: Joi.string().max(150).required(),
  email: Joi.string().email().max(150).required(),
  phone: Joi.string().max(50).allow(null, '')
});

const passwordChange = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(6).required()
});

const userCreate = Joi.object({
  role_id: id.required(),
  full_name: Joi.string().max(150).required(),
  email: Joi.string().email().max(150).required(),
  phone: Joi.string().max(50).allow(null, ''),
  password: Joi.string().min(6).required(),
  status: status('active', 'inactive', 'blocked')
});

const userUpdate = userCreate.fork(['role_id', 'full_name', 'email', 'password'], (field) => field.optional());
const userStatus = Joi.object({ status: status('active', 'inactive', 'blocked').required() });

const roleCreate = Joi.object({
  name: Joi.string().max(100).required(),
  code: Joi.string().max(50).pattern(/^[a-z][a-z0-9_]*$/).required(),
  description: Joi.string().allow(null, '')
});

const roleUpdate = Joi.object({
  name: Joi.string().max(100),
  code: Joi.string().max(50).pattern(/^[a-z][a-z0-9_]*$/),
  description: Joi.string().allow(null, '')
}).min(1);

const rolePermissionsUpdate = Joi.object({
  permissions: Joi.array().items(Joi.string().max(120)).required()
});

const category = Joi.object({
  name: Joi.string().max(150).required(),
  description: Joi.string().allow(null, ''),
  status: status('active', 'inactive')
});
const categoryUpdate = category.fork(['name'], (field) => field.optional());

const supplier = Joi.object({
  name: Joi.string().max(150).required(),
  phone: Joi.string().max(50).allow(null, ''),
  email: Joi.string().email().max(150).allow(null, ''),
  address: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  status: status('active', 'inactive')
});
const supplierUpdate = supplier.fork(['name'], (field) => field.optional());

const itemCreate = Joi.object({
  category_id: id.allow(null),
  supplier_id: id.allow(null),
  name: Joi.string().max(150).required(),
  sku: Joi.string().max(100).allow(null, ''),
  description: Joi.string().allow(null, ''),
  unit: Joi.string().max(50).default('piece'),
  purchase_price: money.default(0),
  selling_price: money.default(0),
  minimum_stock: money.default(0),
  status: status('active', 'inactive')
});

const itemUpdate = itemCreate.fork(['name'], (field) => field.optional());

const stockEntry = Joi.object({
  item_id: id.required(),
  supplier_id: id.allow(null),
  quantity: qty.required(),
  unit_cost: money.default(0),
  entry_date: Joi.date().iso().required(),
  notes: Joi.string().allow(null, '')
});

const stockAdjustment = Joi.object({
  item_id: id.required(),
  adjustment_type: status('adjustment_in', 'adjustment_out').required(),
  quantity: qty.required(),
  notes: Joi.string().allow(null, '')
});

const purchaseOrderCreate = Joi.object({
  supplier_id: id.required(),
  order_date: Joi.date().iso().required(),
  expected_delivery_date: Joi.date().iso().allow(null),
  discount_amount: money.default(0),
  tax_amount: money.default(0),
  notes: Joi.string().allow(null, ''),
  items: Joi.array().items(Joi.object({
    item_id: id.required(),
    ordered_quantity: qty.required(),
    unit_cost: money.required()
  })).min(1).required()
});

const purchaseOrderUpdate = Joi.object({
  expected_delivery_date: Joi.date().iso().allow(null),
  status: status('draft', 'pending', 'partially_received', 'received', 'cancelled'),
  discount_amount: money,
  tax_amount: money,
  notes: Joi.string().allow(null, '')
});

const receivePurchaseOrder = Joi.object({
  received_date: Joi.date().iso(),
  items: Joi.array().items(Joi.object({
    purchase_order_item_id: id.required(),
    received_quantity: qty.required()
  })).min(1).required()
});

const driverCreate = Joi.object({
  user_id: id.allow(null),
  full_name: Joi.string().max(150).required(),
  phone: Joi.string().max(50).allow(null, ''),
  address: Joi.string().allow(null, ''),
  id_number: Joi.string().max(100).allow(null, ''),
  vehicle_type: Joi.string().max(100).allow(null, ''),
  vehicle_plate_number: Joi.string().max(100).allow(null, ''),
  notes: Joi.string().allow(null, ''),
  status: status('active', 'inactive', 'blocked')
});

const driverUpdate = driverCreate.fork(['full_name'], (field) => field.optional());
const driverStatus = Joi.object({ status: status('active', 'inactive', 'blocked').required() });

const stockRequestCreate = Joi.object({
  driver_id: id.required(),
  request_date: Joi.date().iso().required(),
  request_type: status('stock_out', 'stock_return').default('stock_out'),
  discount_amount: money.default(0),
  notes: Joi.string().allow(null, ''),
  items: Joi.array().items(Joi.object({
    item_id: id.required(),
    quantity: qty.required(),
    unit_price: money.required(),
    notes: Joi.string().allow(null, '')
  })).min(1).required()
});

const stockRequestUpdate = Joi.object({
  notes: Joi.string().allow(null, ''),
  request_status: status('draft', 'pending')
});

const paymentCreate = Joi.object({
  stock_request_id: id.required(),
  amount: qty.required(),
  payment_method: status('cash', 'bank_transfer', 'other').default('cash'),
  payment_date: Joi.date().iso().required(),
  notes: Joi.string().allow(null, '')
});

module.exports = {
  pagination,
  login,
  profileUpdate,
  passwordChange,
  userCreate,
  userUpdate,
  userStatus,
  roleCreate,
  roleUpdate,
  rolePermissionsUpdate,
  category,
  categoryUpdate,
  supplier,
  supplierUpdate,
  itemCreate,
  itemUpdate,
  stockEntry,
  stockAdjustment,
  purchaseOrderCreate,
  purchaseOrderUpdate,
  receivePurchaseOrder,
  driverCreate,
  driverUpdate,
  driverStatus,
  stockRequestCreate,
  stockRequestUpdate,
  paymentCreate
};
