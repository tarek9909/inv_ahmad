const { Role, User, AuditLog } = require('../models');
const { list, findOrFail } = require('../services/crudService');
const { createUser, updateUser, includeRole } = require('../services/userService');
const { logAction } = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/responses');

exports.listUsers = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(User, req.query, { include: includeRole, searchFields: ['full_name', 'email', 'phone'] });
  ok(res, 'Users loaded', rows, meta);
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  await logAction({ req, action: 'create', module: 'users', recordId: user.id, newData: req.body });
  created(res, 'User created', await User.findByPk(user.id, { include: includeRole }));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await findOrFail(User, req.params.id, { name: 'User' });
  const oldData = user.toJSON();
  const updated = await updateUser(user, req.body);
  await logAction({ req, action: 'update', module: 'users', recordId: user.id, oldData, newData: updated.toJSON() });
  ok(res, 'User updated', updated);
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const user = await findOrFail(User, req.params.id, { name: 'User' });
  const oldData = user.toJSON();
  await user.update({ status: req.body.status });
  await logAction({ req, action: 'status', module: 'users', recordId: user.id, oldData, newData: user.toJSON() });
  ok(res, 'User status updated', user);
});

exports.listRoles = asyncHandler(async (req, res) => {
  ok(res, 'Roles loaded', await Role.findAll({ order: [['id', 'ASC']] }));
});

exports.listAuditLogs = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(AuditLog, req.query, { include: [{ model: User, as: 'user' }], searchFields: ['action', 'module'] });
  ok(res, 'Audit logs loaded', rows, meta);
});
