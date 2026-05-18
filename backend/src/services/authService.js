const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const HttpError = require('../utils/httpError');

const login = async ({ email, password }) => {
  const user = await User.unscoped().findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });

  if (!user || user.status !== 'active') throw new HttpError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new HttpError(401, 'Invalid credentials');

  await user.update({ last_login_at: new Date() });
  const token = jwt.sign({ id: user.id, role: user.role.code }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  const safeUser = await User.findByPk(user.id, { include: [{ model: Role, as: 'role' }] });

  return { token, user: safeUser };
};

const loadSafeUser = (id) => User.findByPk(id, { include: [{ model: Role, as: 'role' }] });

const updateProfile = async (userId, payload) => {
  const user = await User.unscoped().findByPk(userId);
  if (!user) throw new HttpError(404, 'User not found');

  const existing = await User.unscoped().findOne({
    where: {
      email: payload.email,
      id: { [Op.ne]: userId }
    }
  });
  if (existing) throw new HttpError(409, 'Email is already in use');

  await user.update({
    full_name: payload.full_name,
    email: payload.email,
    phone: payload.phone || null
  });
  return loadSafeUser(userId);
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await User.unscoped().findByPk(userId);
  if (!user) throw new HttpError(404, 'User not found');

  const ok = await bcrypt.compare(current_password, user.password);
  if (!ok) throw new HttpError(400, 'Current password is incorrect');

  const password = await bcrypt.hash(new_password, 10);
  await user.update({ password });
  return true;
};

module.exports = { login, updateProfile, changePassword };
