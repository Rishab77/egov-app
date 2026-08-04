const documentsRepository = require('../repositories/documents.repository');
const { HttpError } = require('../utils/httpError');
const { Pagination } = require('../../../../shared/constants/pagination');

async function listDocumentsByCitizen(req, res, next) {
  try {
    const citizenId = Number(req.params.citizenId);
    if (!Number.isInteger(citizenId)) {
      throw new HttpError(400, 'citizenId must be an integer');
    }

    const limit = Math.min(Number(req.query.limit) || Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT);
    const offset = Number(req.query.offset) || Pagination.DEFAULT_OFFSET;

    const documents = await documentsRepository.findByCitizenId(citizenId, limit, offset);
    res.json({ items: documents, limit, offset });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDocumentsByCitizen };