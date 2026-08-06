const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { env } = require('./config/env');
const citizensHandler = require('./handlers/citizens.handler');
const applicationsHandler = require('./handlers/applications.handler');
const documentsHandler = require('./handlers/documents.handler');

const PROTO_PATH = path.join(__dirname, 'proto', 'citizen_services.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).citizenservices;

function main() {
  const server = new grpc.Server();

  server.addService(proto.CitizenServices.service, {
    GetCitizenProfile: citizensHandler.getCitizenProfile,
    ListCitizens: citizensHandler.listCitizens,
    GetApplicationStatus: applicationsHandler.getApplicationStatus,
    ListApplicationsByCitizen: applicationsHandler.listApplicationsByCitizen,
    ListDocumentsByCitizen: documentsHandler.listDocumentsByCitizen,
  });

  server.bindAsync(
    `0.0.0.0:${env.port}`,
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error('Failed to bind gRPC server:', err);
        process.exit(1);
      }
      console.log(`gRPC service listening on port ${env.port}`);
    }
  );
}

main();