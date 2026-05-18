const HttpError = require('../utils/httpError');

module.exports = (...allowedRoles) => (req, res, next) => {
  const code = req.user && req.user.role && req.user.role.code;
  if (code === 'admin' || allowedRoles.includes(code)) return next();
  return next(new HttpError(403, 'You do not have permission to perform this action'));
};
