const citizensRepository = require('../repositories/citizens.repository');
const { HttpError } = require('../utils/httpError');
const { Pagination } = require('../../../../shared/constants/pagination');

async function getCitizenProfile(req, res, next) {
  try {
    const citizenId = Number(req.params.citizenId);
    if (!Number.isInteger(citizenId)) {
      throw new HttpError(400, 'citizenId must be an integer');
    }

    const citizen = await citizensRepository.findById(citizenId);
    if (!citizen) {
      throw new HttpError(404, 'Citizen not found');
    }

    res.json(citizen);
  } catch (err) {
    next(err);
  }
}

async function listCitizens(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const offset = Number(req.query.offset) || Pagination.DEFAULT_OFFSET;

    const citizens = await citizensRepository.findAll(limit, offset);
    res.json({ items: citizens, limit, offset });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCitizenProfile, listCitizens };