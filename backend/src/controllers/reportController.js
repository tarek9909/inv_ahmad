const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/responses');

exports.dashboard = asyncHandler(async (req, res) => ok(res, 'Dashboard loaded', await reportService.dashboard()));
exports.inventorySummary = asyncHandler(async (req, res) => ok(res, 'Inventory summary loaded', await reportService.inventorySummary()));
exports.driverBalances = asyncHandler(async (req, res) => ok(res, 'Driver balances loaded', await reportService.driverBalances()));
exports.paymentSummary = asyncHandler(async (req, res) => ok(res, 'Payment summary loaded', await reportService.paymentSummary()));
exports.purchaseSummary = asyncHandler(async (req, res) => ok(res, 'Purchase summary loaded', await reportService.purchaseSummary()));
