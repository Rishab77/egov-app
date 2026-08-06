const { buildSchema } = require('graphql');

// ApplicationStatus and DocumentType values mirror shared/enums/*.js
const schema = buildSchema(`
  enum ApplicationStatus {
    PENDING
    UNDER_REVIEW
    APPROVED
    REJECTED
    ISSUED
  }

  enum DocumentType {
    CITIZENSHIP_CERT
    PASSPORT_COPY
    LAND_DEED
    TAX_CLEARANCE
    RECOMMENDATION_LETTER
  }

  type Citizen {
    citizenId: Int!
    fullName: String!
    citizenshipNo: String!
    district: String!
    province: String!
    phoneNumber: String
    email: String
    dateOfBirth: String!
    createdAt: String!
    applications: [ServiceApplication!]!
    documents(limit: Int, offset: Int): [Document!]!
  }

  type ServiceApplication {
    applicationId: Int!
    citizenId: Int!
    serviceName: String!
    status: ApplicationStatus!
    submittedAt: String!
    lastUpdatedAt: String!
    remarks: String
  }

  type Document {
    documentId: Int!
    citizenId: Int!
    applicationId: Int
    documentType: DocumentType!
    fileName: String!
    fileSizeBytes: Int!
    uploadedAt: String!
  }

  type CitizenList {
    items: [Citizen!]!
  }

  type ApplicationList {
    items: [ServiceApplication!]!
  }

  type DocumentList {
    items: [Document!]!
  }

  type Query {
    citizenProfile(citizenId: Int!): Citizen
    citizens(limit: Int, offset: Int): CitizenList!
    applicationStatus(applicationId: Int!): ServiceApplication
    applicationsByCitizen(citizenId: Int!): ApplicationList!
    documentsByCitizen(citizenId: Int!, limit: Int, offset: Int): DocumentList!
  }
`);

module.exports = { schema };