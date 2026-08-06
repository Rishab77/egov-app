const citizensRepository = require('../repositories/citizens.repository');
const applicationsRepository = require('../repositories/applications.repository');
const documentsRepository = require('../repositories/documents.repository');
const { notFound, invalidArgument } = require('../utils/graphqlError');
const { Pagination } = require('../../../../shared/constants/pagination');

function toGraphqlCitizen(row) {
  return {
    citizenId: row.citizen_id,
    fullName: row.full_name,
    citizenshipNo: row.citizenship_no,
    district: row.district,
    province: row.province,
    phoneNumber: row.phone_number,
    email: row.email,
    dateOfBirth: row.date_of_birth.toISOString().split('T')[0],
    createdAt: row.created_at.toISOString(),
    // Resolved lazily below so REST-equivalent flat queries don't pay the join cost.
    applications: async () => (await applicationsRepository.findByCitizenId(row.citizen_id)).map(toGraphqlApplication),
    documents: async ({ limit, offset }) =>
      (await documentsRepository.findByCitizenId(
        row.citizen_id,
        limit || Pagination.DEFAULT_LIMIT,
        offset || Pagination.DEFAULT_OFFSET
      )).map(toGraphqlDocument),
  };
}

function toGraphqlApplication(row) {
  return {
    applicationId: row.application_id,
    citizenId: row.citizen_id,
    serviceName: row.service_name,
    status: row.status,
    submittedAt: row.submitted_at.toISOString(),
    lastUpdatedAt: row.last_updated_at.toISOString(),
    remarks: row.remarks,
  };
}

function toGraphqlDocument(row) {
  return {
    documentId: row.document_id,
    citizenId: row.citizen_id,
    applicationId: row.application_id,
    documentType: row.document_type,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    uploadedAt: row.uploaded_at.toISOString(),
  };
}

const root = {
  citizenProfile: async ({ citizenId }) => {
    if (!Number.isInteger(citizenId)) throw invalidArgument('citizenId must be an integer');
    const citizen = await citizensRepository.findById(citizenId);
    if (!citizen) throw notFound('Citizen not found');
    return toGraphqlCitizen(citizen);
  },

  citizens: async ({ limit, offset }) => {
    const citizens = await citizensRepository.findAll(
      Math.min(limit || Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT),
      offset || Pagination.DEFAULT_OFFSET
    );
    return { items: citizens.map(toGraphqlCitizen) };
  },

  applicationStatus: async ({ applicationId }) => {
    if (!Number.isInteger(applicationId)) throw invalidArgument('applicationId must be an integer');
    const application = await applicationsRepository.findById(applicationId);
    if (!application) throw notFound('Application not found');
    return toGraphqlApplication(application);
  },

  applicationsByCitizen: async ({ citizenId }) => {
    if (!Number.isInteger(citizenId)) throw invalidArgument('citizenId must be an integer');
    const applications = await applicationsRepository.findByCitizenId(citizenId);
    return { items: applications.map(toGraphqlApplication) };
  },

  documentsByCitizen: async ({ citizenId, limit, offset }) => {
    if (!Number.isInteger(citizenId)) throw invalidArgument('citizenId must be an integer');
    const documents = await documentsRepository.findByCitizenId(
      citizenId,
      Math.min(limit || Pagination.DEFAULT_LIMIT, Pagination.MAX_LIMIT),
      offset || Pagination.DEFAULT_OFFSET
    );
    return { items: documents.map(toGraphqlDocument) };
  },
};

module.exports = { root };