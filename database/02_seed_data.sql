USE medcore_ehr;

INSERT INTO users (user_id, email, password_hash, role) VALUES
(1, 'dr.ahmed@medcore.com', '$2a$10$dummyhashfornow1111111111111111111111111111111111', 'DOCTOR'),
(2, 'dr.sara@medcore.com', '$2a$10$dummyhashfornow1111111111111111111111111111111111', 'DOCTOR'),
(3, 'ali.patient@gmail.com', '$2a$10$dummyhashfornow1111111111111111111111111111111111', 'PATIENT'),
(4, 'ayesha.patient@gmail.com', '$2a$10$dummyhashfornow1111111111111111111111111111111111', 'PATIENT'),
(5, 'bilal.lab@medcore.com', '$2a$10$dummyhashfornow1111111111111111111111111111111111', 'LAB_TECH');

INSERT INTO doctors (doctor_id, full_name, license_number, specialization, consultation_fee) VALUES
(1, 'Dr. Ahmed Raza', 'PMC-44921', 'Cardiologist', 2500.00),
(2, 'Dr. Sara Khan', 'PMC-51084', 'General Physician', 1500.00);

INSERT INTO patients (patient_id, full_name, date_of_birth, gender, blood_group, phone) VALUES
(3, 'Ali Hassan', '2002-05-14', 'Male', 'O+', '0300-1234567'),
(4, 'Ayesha Tariq', '2001-11-22', 'Female', 'B+', '0321-9876543');

INSERT INTO lab_technicians (tech_id, full_name, lab_department, certification_id) VALUES
(5, 'Bilal Mahmood', 'Hematology & Pathology', 'LAB-9012');

INSERT INTO appointments (appointment_id, patient_id, doctor_id, slot_date, slot_time, status, reason) VALUES
(1, 3, 2, CURDATE(), '10:00:00', 'SCHEDULED', 'Persistent fever and fatigue'),
(2, 4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00', 'SCHEDULED', 'Routine blood pressure checkup');

INSERT INTO medical_records (record_id, appointment_id, diagnosis_code, diagnosis_title, doctor_notes, vitals) VALUES
(1, 1, 'R50.9', 'Viral Fever & Mild Dehydration', 'Advised 3 days bed rest, plenty of fluids, and CBC blood test.', '{"bp": "115/75", "temp_f": 101.2, "pulse": 88}');

INSERT INTO prescriptions (prescription_id, record_id, issued_date, valid_until) VALUES
(1, 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY));

INSERT INTO prescription_items (prescription_id, item_number, medicine_name, dosage, frequency, duration_days) VALUES
(1, 1, 'Panadol Extra', '500mg', 'Twice daily after meals', 5),
(1, 2, 'ORS Sachet', '1 packet in 1L water', 'Sip throughout the day', 3);

INSERT INTO lab_orders (order_id, record_id, test_type, priority, status) VALUES
(1, 1, 'Complete Blood Count (CBC)', 'URGENT', 'PENDING');
