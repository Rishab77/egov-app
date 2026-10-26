import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { GRPC_URL, VUS, DURATION } from './lib/config.js';
import { grpcThresholds } from './lib/thresholds.js';

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: grpcThresholds,
};

const protoPath = __ENV.GRPC_PROTO_PATH || '../../services/grpc-service/src/proto/citizen_services.proto';

let client;

export default function () {
  if (!client) {
    client = new grpc.Client();
    client.load([], protoPath);
    client.connect(GRPC_URL, { plaintext: true });
  }

  const citizen = client.invoke('citizenservices.CitizenServices/GetCitizenProfile', { citizen_id: 1 });
  check(citizen, {
    'gRPC citizen profile OK': (r) => r && r.status === grpc.StatusOK,
  });

  const citizens = client.invoke('citizenservices.CitizenServices/ListCitizens', { limit: 20, offset: 0 });
  check(citizens, {
    'gRPC citizens list OK': (r) => r && r.status === grpc.StatusOK,
  });

  const applications = client.invoke('citizenservices.CitizenServices/ListApplicationsByCitizen', { citizen_id: 1 });
  check(applications, {
    'gRPC applications list OK': (r) => r && r.status === grpc.StatusOK,
  });

  const documents = client.invoke('citizenservices.CitizenServices/ListDocumentsByCitizen', { citizen_id: 1, limit: 20, offset: 0 });
  check(documents, {
    'gRPC documents list OK': (r) => r && r.status === grpc.StatusOK,
  });

  sleep(0.1);
}
