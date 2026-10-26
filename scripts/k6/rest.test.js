import http from 'k6/http';
import { check, sleep } from 'k6';
import { REST_URL, VUS, DURATION } from './lib/config.js';
import { restThresholds } from './lib/thresholds.js';

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: restThresholds,
};

export default function () {
  const health = http.get(`${REST_URL}/api/health`, { timeout: '2s' });
  check(health, {
    'REST health check OK': (r) => r.status === 200,
  });

  const citizen = http.get(`${REST_URL}/api/citizens/1`, { timeout: '2s' });
  check(citizen, {
    'REST citizen profile OK': (r) => r.status === 200,
  });

  const listCitizens = http.get(`${REST_URL}/api/citizens?limit=20&offset=0`, { timeout: '2s' });
  check(listCitizens, {
    'REST citizens list OK': (r) => r.status === 200,
  });

  const applications = http.get(`${REST_URL}/api/applications/by-citizen/1`, { timeout: '2s' });
  check(applications, {
    'REST application list OK': (r) => r.status === 200,
  });

  const documents = http.get(`${REST_URL}/api/documents/by-citizen/1?limit=20&offset=0`, { timeout: '2s' });
  check(documents, {
    'REST documents list OK': (r) => r.status === 200,
  });

  sleep(0.1);
}
