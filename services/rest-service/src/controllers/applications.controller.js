const applicationsRepository = require('../repositories/applications.repository');
const { HttpError } = require('../utils/httpError');

async function getApplicationStatus(req, res, next) {
  try {
    const applicationId = Number(req.params.applicationId);
    if (!Number.isInteger(applicationId)) {
      throw new HttpError(400, 'applicationId must be an integer');
    }

    const application = await applicationsRepository.findById(applicationId);
    if (!application) {
      throw new HttpError(404, 'Application not found');
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
}

async function listApplicationsByCitizen(req, res, next) {
  try {
    const citizenId = Number(req.params.citizenId);
    if (!Number.isInteger(citizenId)) {
      throw new HttpError(400, 'citizenId must be an integer');
    }

    const applications = await applicationsRepository.findByCitizenId(citizenId);
    res.json({ items: applications });
  } catch (err) {
    next(err);
  }
}

module.exports = { getApplicationStatus, listApplicationsByCitizen };