const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { User, Role } = require('../models');
const HttpError = require('../utils/httpError');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) throw new HttpError(401, 'Authentication token is required');

    const payload = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(payload.id, { include: [{ model: Role, as: 'role' }] });

    if (!user || user.status !== 'active') throw new HttpError(401, 'User is not allowed to access the system');

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, 'Invalid or expired token'));
  }
};

module.exports = authenticate;
