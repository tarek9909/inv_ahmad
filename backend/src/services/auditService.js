const { AuditLog } = require('../models');

const logAction = async ({ req, action, module, recordId, oldData = null, newData = null, transaction = null }) => {
  await AuditLog.create({
    user_id: req.user ? req.user.id : null,
    action,
    module,
    record_id: recordId || null,
    old_data: oldData,
    new_data: newData,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  }, { transaction });
};

module.exports = { logAction };
