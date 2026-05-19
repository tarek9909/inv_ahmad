const { Setting } = require('../models');
const { logAction } = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/responses');

const SETTING_KEYS = {
  accepted_request_fulfillment_mode: ['print', 'driver_portal', 'both'],
  qz_tray_enabled: ['true', 'false'],
  qz_default_printer: null
};

exports.listSettings = asyncHandler(async (req, res) => {
  const rows = await Setting.findAll({ order: [['setting_key', 'ASC']] });
  const settings = {};
  rows.forEach((row) => { settings[row.setting_key] = row.setting_value || ''; });
  ok(res, 'Settings loaded', settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const updates = {};
  Object.entries(req.body || {}).forEach(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(SETTING_KEYS, key)) return;
    const stringValue = String(value ?? '');
    const allowed = SETTING_KEYS[key];
    if (allowed && !allowed.includes(stringValue)) return;
    updates[key] = stringValue;
  });

  const oldRows = await Setting.findAll();
  const oldData = Object.fromEntries(oldRows.map((row) => [row.setting_key, row.setting_value]));

  for (const [key, value] of Object.entries(updates)) {
    const valueType = key === 'qz_tray_enabled' ? 'boolean' : 'string';
    const existing = await Setting.findOne({ where: { setting_key: key } });
    if (existing) {
      await existing.update({ setting_value: value, value_type: valueType, updated_by: req.user.id, updated_at: new Date() });
    } else {
      await Setting.create({ setting_key: key, setting_value: value, value_type: valueType, updated_by: req.user.id, updated_at: new Date() });
    }
  }

  await logAction({ req, action: 'update', module: 'settings', newData: updates, oldData });
  const rows = await Setting.findAll({ order: [['setting_key', 'ASC']] });
  ok(res, 'Settings updated', Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value || ''])));
});
