const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/', require('./adminRoutes'));
router.use('/', require('./inventoryRoutes'));
router.use('/', require('./accountantRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;
