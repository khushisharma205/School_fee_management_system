DROP DATABASE school_fee_management;
CREATE DATABASE IF NOT EXISTS school_fee_management;
USE school_fee_management;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'accountant') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(30) NOT NULL UNIQUE,
    roll_no VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    section_name VARCHAR(20),
    parent_name VARCHAR(150),
    phone VARCHAR(20),
    address TEXT,
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_ref_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'upi', 'bank') DEFAULT 'cash',
    reference_no VARCHAR(100),
    remarks TEXT,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (student_ref_id) REFERENCES students(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin User',
    'admin@school.com',
    '$2b$10$Hdb..c2C0pGCJgYRNUeczuIvgAJAbQPIDwhx1dB6/M9V5mbLmwZqi',
    'admin'
   
)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO students (student_id, roll_no, full_name, class_name, section_name, parent_name, phone, address, total_fee)
VALUES
('STU001', 'R001', 'Aarav Sharma', '10', 'A', 'Raj Sharma', '9876543210', 'Delhi', 50000),
('STU002', 'R002', 'Priya Verma', '9', 'B', 'Amit Verma', '9123456780', 'Lucknow', 42000),
('STU003', 'R003', 'Mohit Kumar', '8', 'A', 'Sunil Kumar', '9988776655', 'Jaipur', 38000)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO payments (student_ref_id, amount, payment_method, reference_no, remarks, created_by)
SELECT s.id, v.amount, v.payment_method, v.reference_no, v.remarks, 1
FROM (
  SELECT 'STU001' AS student_id, 20000 AS amount, 'cash' AS payment_method, 'REF-1001' AS reference_no, 'First installment' AS remarks
  UNION ALL
  SELECT 'STU002', 42000, 'upi', 'REF-1002', 'Full payment'
) v
JOIN students s ON s.student_id = v.student_id;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM payments;
SELECT SUM(amount) AS total FROM payments;
select * from students;
DELETE FROM payments WHERE id > 3;
select * from students;
UPDATE students SET is_deleted = 1 WHERE id IN (4, 5);
select * from students;



