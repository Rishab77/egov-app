const { Router } = require('express');
const { getCitizenProfile, listCitizens } = require('../controllers/citizens.controller');

const router = Router();

router.get('/', listCitizens);
router.get('/:citizenId', getCitizenProfile);

module.exports = router;