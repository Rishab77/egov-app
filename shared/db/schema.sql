-- Single schema shared by all three protocol implementations.
-- Domain: citizen services portal (proposal section 7.1).

CREATE TABLE IF NOT EXISTS citizens (
    citizen_id      SERIAL PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    citizenship_no  VARCHAR(50) NOT NULL UNIQUE,
    district        VARCHAR(100) NOT NULL,
    province        VARCHAR(100) NOT NULL,
    phone_number    VARCHAR(20),
    email           VARCHAR(150),
    date_of_birth   DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ApplicationStatus enum values: PENDING, UNDER_REVIEW, APPROVED, REJECTED, ISSUED
CREATE TABLE IF NOT EXISTS service_applications (
    application_id      SERIAL PRIMARY KEY,
    citizen_id           INTEGER NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
    service_name         VARCHAR(150) NOT NULL,
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    remarks               TEXT
);

-- DocumentType enum values: CITIZENSHIP_CERT, PASSPORT_COPY, LAND_DEED, TAX_CLEARANCE, RECOMMENDATION_LETTER
CREATE TABLE IF NOT EXISTS documents (
    document_id      SERIAL PRIMARY KEY,
    citizen_id        INTEGER NOT NULL REFERENCES citizens(citizen_id) ON DELETE CASCADE,
    application_id     INTEGER REFERENCES service_applications(application_id) ON DELETE SET NULL,
    document_type       VARCHAR(30) NOT NULL,
    file_name             VARCHAR(200) NOT NULL,
    file_size_bytes         INTEGER NOT NULL,
    uploaded_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_citizen_id ON service_applications(citizen_id);
CREATE INDEX IF NOT EXISTS idx_documents_citizen_id ON documents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);