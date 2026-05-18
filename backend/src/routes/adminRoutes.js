const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

const adminOnly = [authenticate, authorize('admin')];

router.get('/users', ...adminOnly, validate(schemas.pagination, 'query'), adminController.listUsers);
router.post('/users', ...adminOnly, validate(schemas.userCreate), adminController.createUser);
router.patch('/users/:id', ...adminOnly, validate(schemas.userUpdate), adminController.updateUser);
router.patch('/users/:id/status', ...adminOnly, validate(schemas.userStatus), adminController.updateUserStatus);
router.get('/roles', ...adminOnly, adminController.listRoles);
router.get('/audit-logs', ...adminOnly, validate(schemas.pagination, 'query'), adminController.listAuditLogs);

module.exports = router;
