const { Router } = require('express');
const { listDocumentsByCitizen } = require('../controllers/documents.controller');

const router = Router();

router.get('/by-citizen/:citizenId', listDocumentsByCitizen);

module.exports = router;