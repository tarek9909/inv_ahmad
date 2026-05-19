const { Op } = require('sequelize');
const { Role, User, AuditLog, Permission, RolePermission, sequelize } = require('../models');
const { list, findOrFail } = require('../services/crudService');
const { createUser, updateUser, includeRole } = require('../services/userService');
const { logAction } = require('../services/auditService');
const { permissions: permissionCatalog } = require('../config/permissions');
const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/responses');
const HttpError = require('../utils/httpError');

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

exports.createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  await logAction({ req, action: 'create', module: 'roles', recordId: role.id, newData: role.toJSON() });
  created(res, 'Role created', role);
});

exports.updateRole = asyncHandler(async (req, res) => {
  const role = await findOrFail(Role, req.params.id, { name: 'Role' });
  if (role.code === 'admin' && req.body.code && req.body.code !== 'admin') {
    throw new HttpError(400, 'The admin role code cannot be changed');
  }
  const conflictChecks = [
    ...(req.body.name ? [{ name: req.body.name }] : []),
    ...(req.body.code ? [{ code: req.body.code }] : [])
  ];
  if (conflictChecks.length) {
    const conflict = await Role.findOne({ where: { id: { [Op.ne]: role.id }, [Op.or]: conflictChecks } });
    if (conflict) throw new HttpError(409, 'Role name or code is already in use');
  }
  const oldData = role.toJSON();
  await role.update(req.body);
  await logAction({ req, action: 'update', module: 'roles', recordId: role.id, oldData, newData: role.toJSON() });
  ok(res, 'Role updated', role);
});

exports.listPermissions = asyncHandler(async (req, res) => {
  const rows = await Permission.findAll({ order: [['module', 'ASC'], ['feature', 'ASC'], ['permission_key', 'ASC']] });
  ok(res, 'Permissions loaded', rows.length ? rows : permissionCatalog);
});

exports.getRolePermissions = asyncHandler(async (req, res) => {
  const role = await findOrFail(Role, req.params.id, {
    name: 'Role',
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }]
  });
  const keys = role.code === 'admin'
    ? permissionCatalog.map((permission) => permission.key)
    : (role.permissions || []).map((permission) => permission.permission_key);
  ok(res, 'Role permissions loaded', { role, permissions: keys });
});

exports.updateRolePermissions = asyncHandler(async (req, res) => {
  const role = await findOrFail(Role, req.params.id, { name: 'Role' });
  if (role.code === 'admin') throw new HttpError(400, 'Admin role always has all permissions');

  const allowedKeys = permissionCatalog.map((permission) => permission.key);
  const keys = [...new Set(req.body.permissions || [])].filter((key) => allowedKeys.includes(key));
  const permissionRows = await Permission.findAll({ where: { permission_key: keys } });

  await sequelize.transaction(async (transaction) => {
    const oldData = {
      role: role.toJSON(),
      permissions: (await RolePermission.findAll({ where: { role_id: role.id }, include: [{ model: Permission, as: 'permission' }], transaction }))
        .map((row) => row.permission?.permission_key)
        .filter(Boolean)
    };
    await RolePermission.destroy({ where: { role_id: role.id }, transaction });
    if (permissionRows.length) {
      await RolePermission.bulkCreate(permissionRows.map((permission) => ({
        role_id: role.id,
        permission_id: permission.id
      })), { transaction });
    }
    await logAction({
      req,
      action: 'permissions',
      module: 'roles',
      recordId: role.id,
      oldData,
      newData: { permissions: keys },
      transaction
    });
  });

  ok(res, 'Role permissions updated', { role, permissions: keys });
});

exports.listAuditLogs = asyncHandler(async (req, res) => {
  const { rows, meta } = await list(AuditLog, req.query, { include: [{ model: User, as: 'user' }], searchFields: ['action', 'module'] });
  ok(res, 'Audit logs loaded', rows, meta);
});
