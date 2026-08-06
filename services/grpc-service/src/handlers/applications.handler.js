const applicationsRepository = require('../repositories/applications.repository');
const { notFound, invalidArgument } = require('../utils/grpcError');

function toProtoApplication(row) {
  return {
    application_id: row.application_id,
    citizen_id: row.citizen_id,
    service_name: row.service_name,
    status: row.status,
    submitted_at: row.submitted_at.toISOString(),
    last_updated_at: row.last_updated_at.toISOString(),
    remarks: row.remarks || '',
  };
}

async function getApplicationStatus(call, callback) {
  const { application_id: applicationId } = call.request;

  if (!Number.isInteger(applicationId)) {
    return callback(invalidArgument('application_id must be an integer'));
  }

  const application = await applicationsRepository.findById(applicationId);
  if (!application) {
    return callback(notFound('Application not found'));
  }

  callback(null, toProtoApplication(application));
}

async function listApplicationsByCitizen(call, callback) {
  const { citizen_id: citizenId } = call.request;

  if (!Number.isInteger(citizenId)) {
    return callback(invalidArgument('citizen_id must be an integer'));
  }

  const applications = await applicationsRepository.findByCitizenId(citizenId);
  callback(null, { items: applications.map(toProtoApplication) });
}

module.exports = { getApplicationStatus, listApplicationsByCitizen };