-- Deterministic seed data. Identical across REST, gRPC, and GraphQL services
-- so benchmark results reflect protocol overhead, not data variance.

TRUNCATE documents, service_applications, citizens RESTART IDENTITY CASCADE;

INSERT INTO citizens (full_name, citizenship_no, district, province, phone_number, email, date_of_birth) VALUES
('Rishab Shrestha', 'CIT-2081-001', 'Kathmandu', 'Bagmati', '9800000001', 'rishab@example.com', '1998-03-12'),
('Anita Gurung', 'CIT-2081-002', 'Pokhara', 'Gandaki', '9800000002', 'anita@example.com', '1995-07-21'),
('Bikash Thapa', 'CIT-2081-003', 'Surkhet', 'Karnali', '9800000003', 'bikash@example.com', '1990-11-05'),
('Sunita Rai', 'CIT-2081-004', 'Dhangadhi', 'Sudurpashchim', '9800000004', 'sunita@example.com', '1993-01-30'),
('Prakash Magar', 'CIT-2081-005', 'Butwal', 'Lumbini', '9800000005', 'prakash@example.com', '1988-09-14'),
('Sarita KC', 'CIT-2081-006', 'Dharan', 'Koshi', '9800000006', 'sarita@example.com', '1997-05-02'),
('Manish Shakya', 'CIT-2081-007', 'Lalitpur', 'Bagmati', '9800000007', 'manish@example.com', '1992-12-18'),
('Kritika Basnet', 'CIT-2081-008', 'Birgunj', 'Madhesh', '9800000008', 'kritika@example.com', '1996-04-09'),
('Dipesh Karki', 'CIT-2081-009', 'Nepalgunj', 'Lumbini', '9800000009', 'dipesh@example.com', '1991-08-27'),
('Rojina Adhikari', 'CIT-2081-010', 'Hetauda', 'Bagmati', '9800000010', 'rojina@example.com', '1994-02-15');

INSERT INTO service_applications (citizen_id, service_name, status, remarks) VALUES
(1, 'Passport Renewal', 'UNDER_REVIEW', 'Awaiting document verification'),
(1, 'Tax Clearance Certificate', 'APPROVED', NULL),
(2, 'Land Ownership Transfer', 'PENDING', NULL),
(3, 'Citizenship Certificate Copy', 'ISSUED', 'Collected at DAO Surkhet'),
(4, 'Driving License Renewal', 'REJECTED', 'Expired medical certificate'),
(5, 'Passport Renewal', 'PENDING', NULL),
(6, 'Business Registration', 'UNDER_REVIEW', 'Pending tax office confirmation'),
(7, 'Recommendation Letter', 'ISSUED', NULL),
(8, 'Land Ownership Transfer', 'APPROVED', NULL),
(9, 'Tax Clearance Certificate', 'PENDING', NULL),
(10, 'Citizenship Certificate Copy', 'UNDER_REVIEW', NULL);

INSERT INTO documents (citizen_id, application_id, document_type, file_name, file_size_bytes) VALUES
(1, 1, 'PASSPORT_COPY', 'passport_scan_rishab.pdf', 482300),
(1, 2, 'TAX_CLEARANCE', 'tax_clearance_2081.pdf', 210500),
(2, 3, 'LAND_DEED', 'land_deed_pokhara.pdf', 903200),
(3, 4, 'CITIZENSHIP_CERT', 'citizenship_bikash.pdf', 355100),
(4, 5, 'RECOMMENDATION_LETTER', 'medical_cert_sunita.pdf', 128900),
(5, 6, 'PASSPORT_COPY', 'passport_scan_prakash.pdf', 467800),
(6, 7, 'TAX_CLEARANCE', 'business_tax_sarita.pdf', 199400),
(7, 8, 'RECOMMENDATION_LETTER', 'recommendation_manish.pdf', 88200),
(8, 9, 'LAND_DEED', 'land_deed_birgunj.pdf', 845600),
(9, 10, 'TAX_CLEARANCE', 'tax_clearance_dipesh.pdf', 176300),
(10, 11, 'CITIZENSHIP_CERT', 'citizenship_rojina.pdf', 341700);