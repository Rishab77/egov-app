/**
 * The three benchmark operations defined in proposal section 4.2 objective 2.
 * Used to label k6 scenarios and log entries consistently across all three services.
 */
const ServiceOperation = Object.freeze({
  GET_CITIZEN_PROFILE: 'GET_CITIZEN_PROFILE',
  GET_APPLICATION_STATUS: 'GET_APPLICATION_STATUS',
  LIST_DOCUMENTS: 'LIST_DOCUMENTS',
});

module.exports = { ServiceOperation };