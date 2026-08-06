const citizensRepository = require('../repositories/citizens.repository');
const { notFound, invalidArgument } = require('../utils/grpcError');

function toProtoCitizen(row) {
  return {
    citizen_id: row.citizen_id,
    full_name: row.full_name,
    citizenship_no: row.citizenship_no,
    district: row.district,
    province: row.province,
    phone_number: row.phone_number || '',
    email: row.email || '',
    date_of_birth: row.date_of_birth.toISOString().split('T')[0],
    created_at: row.created_at.toISOString(),
  };
}

async function getCitizenProfile(call, callback) {
  const { citizen_id: citizenId } = call.request;

  if (!Number.isInteger(citizenId)) {
    return callback(invalidArgument('citizen_id must be an integer'));
  }

  const citizen = await citizensRepository.findById(citizenId);
  if (!citizen) {
    return callback(notFound('Citizen not found'));
  }

  callback(null, toProtoCitizen(citizen));
}

async function listCitizens(call, callback) {
  const { limit, offset } = call.request;
  const citizens = await citizensRepository.findAll(limit || 20, offset || 0);
  callback(null, { items: citizens.map(toProtoCitizen) });
}

module.exports = { getCitizenProfile, listCitizens };