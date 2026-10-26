import http from 'k6/http';
import { check, sleep } from 'k6';
import { GRAPHQL_URL, VUS, DURATION } from './lib/config.js';
import { restThresholds } from './lib/thresholds.js';

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: restThresholds,
};

const queries = {
  citizenProfile: `
    query {
      citizenProfile(citizenId: 1) {
        citizenId
        fullName
        district
        province
      }
    }
  `,
  applicationsByCitizen: `
    query {
      applicationsByCitizen(citizenId: 1) {
        items {
          applicationId
          serviceName
          status
        }
      }
    }
  `,
  documentsByCitizen: `
    query {
      documentsByCitizen(citizenId: 1, limit: 20, offset: 0) {
        items {
          documentId
          documentType
          fileName
        }
      }
    }
  `,
};

export default function () {
  const health = http.post(
    GRAPHQL_URL,
    JSON.stringify({ query: '{ __typename }' }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '2s' }
  );
  check(health, {
    'GraphQL health check OK': (r) => r.status === 200,
  });

  const citizen = http.post(
    GRAPHQL_URL,
    JSON.stringify({ query: queries.citizenProfile }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '2s' }
  );
  check(citizen, {
    'GraphQL citizen profile OK': (r) => r.status === 200 && !JSON.parse(r.body).errors,
  });

  const applications = http.post(
    GRAPHQL_URL,
    JSON.stringify({ query: queries.applicationsByCitizen }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '2s' }
  );
  check(applications, {
    'GraphQL applications OK': (r) => r.status === 200 && !JSON.parse(r.body).errors,
  });

  const documents = http.post(
    GRAPHQL_URL,
    JSON.stringify({ query: queries.documentsByCitizen }),
    { headers: { 'Content-Type': 'application/json' }, timeout: '2s' }
  );
  check(documents, {
    'GraphQL documents OK': (r) => r.status === 200 && !JSON.parse(r.body).errors,
  });

  sleep(0.1);
}
