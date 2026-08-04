const { Router } = require('express');
const citizensRoutes = require('./citizens.routes');
const applicationsRoutes = require('./applications.routes');
const documentsRoutes = require('./documents.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok', protocol: 'REST' }));
router.use('/citizens', citizensRoutes);
router.use('/applications', applicationsRoutes);
router.use('/documents', documentsRoutes);

module.exports = router;