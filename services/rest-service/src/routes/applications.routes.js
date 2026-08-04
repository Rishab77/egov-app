const { Router } = require('express');
const {
  getApplicationStatus,
  listApplicationsByCitizen,
} = require('../controllers/applications.controller');

const router = Router();

router.get('/:applicationId', getApplicationStatus);
router.get('/by-citizen/:citizenId', listApplicationsByCitizen);

module.exports = router;