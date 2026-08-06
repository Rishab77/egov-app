const documentsRepository = require('../repositories/documents.repository');
const { invalidArgument } = require('../utils/grpcError');

function toProtoDocument(row) {
  return {
    document_id: row.document_id,
    citizen_id: row.citizen_id,
    application_id: row.application_id || 0,
    document_type: row.document_type,
    file_name: row.file_name,
    file_size_bytes: row.file_size_bytes,
    uploaded_at: row.uploaded_at.toISOString(),
  };
}

async function listDocumentsByCitizen(call, callback) {
  const { citizen_id: citizenId, limit, offset } = call.request;

  if (!Number.isInteger(citizenId)) {
    return callback(invalidArgument('citizen_id must be an integer'));
  }

  const documents = await documentsRepository.findByCitizenId(citizenId, limit || 20, offset || 0);
  callback(null, { items: documents.map(toProtoDocument) });
}

module.exports = { listDocumentsByCitizen };