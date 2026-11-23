DROP DATABASE IF EXISTS medcore_ehr;
CREATE DATABASE medcore_ehr;
USE medcore_ehr;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('PATIENT', 'DOCTOR', 'LAB_TECH', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE patients (
    patient_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE doctors (
    doctor_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    consultation_fee DECIMAL(10, 2) NOT NULL CHECK (consultation_fee >= 0),
    FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lab_technicians (
    tech_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    lab_department VARCHAR(100) NOT NULL,
    certification_id VARCHAR(50) NOT NULL UNIQUE,
    FOREIGN KEY (tech_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE RESTRICT,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE RESTRICT,
    UNIQUE KEY unique_doctor_slot (doctor_id, slot_date, slot_time)
) ENGINE=InnoDB;

CREATE TABLE medical_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE,
    diagnosis_code VARCHAR(20) NOT NULL,
    diagnosis_title VARCHAR(200) NOT NULL,
    doctor_notes TEXT NOT NULL,
    vitals JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE prescriptions (
    prescription_id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL UNIQUE,
    issued_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    FOREIGN KEY (record_id) REFERENCES medical_records(record_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE prescription_items (
    prescription_id INT NOT NULL,
    item_number INT NOT NULL,
    medicine_name VARCHAR(120) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(80) NOT NULL,
    duration_days INT NOT NULL CHECK (duration_days > 0),
    PRIMARY KEY (prescription_id, item_number),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lab_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    priority ENUM('ROUTINE', 'URGENT') DEFAULT 'ROUTINE',
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES medical_records(record_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE lab_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    tech_id INT NOT NULL,
    metrics JSON NOT NULL,
    remarks VARCHAR(255),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (tech_id) REFERENCES lab_technicians(tech_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    details VARCHAR(255) NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

DELIMITER //

CREATE TRIGGER trg_after_medical_record_insert
AFTER INSERT ON medical_records
FOR EACH ROW
BEGIN
    UPDATE appointments 
    SET status = 'COMPLETED' 
    WHERE appointment_id = NEW.appointment_id;

    INSERT INTO audit_logs (action_type, table_name, record_id, details)
    VALUES ('INSERT', 'medical_records', NEW.record_id, CONCAT('Medical record created for appointment #', NEW.appointment_id));
END//

CREATE TRIGGER trg_after_lab_result_insert
AFTER INSERT ON lab_results
FOR EACH ROW
BEGIN
    UPDATE lab_orders 
    SET status = 'COMPLETED' 
    WHERE order_id = NEW.order_id;

    INSERT INTO audit_logs (action_type, table_name, record_id, details)
    VALUES ('INSERT', 'lab_results', NEW.result_id, CONCAT('Lab result verified by Tech #', NEW.tech_id, ' for Order #', NEW.order_id));
END//

DELIMITER ;

CREATE VIEW vw_doctor_appointments AS
SELECT 
    a.appointment_id,
    a.doctor_id,
    d.full_name AS doctor_name,
    d.specialization,
    a.patient_id,
    p.full_name AS patient_name,
    p.blood_group,
    a.slot_date,
    a.slot_time,
    a.status,
    a.reason
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN patients p ON a.patient_id = p.patient_id;