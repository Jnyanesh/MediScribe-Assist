import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'mediscribe.db');
const db = new Database(dbPath);

const initDb = () => {
    db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      medicalHistory TEXT
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      doctor_name TEXT,
      date TEXT,
      transcript TEXT,
      summary TEXT,
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      consultation_id TEXT,
      patient_id TEXT,
      medication TEXT,
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      status TEXT DEFAULT 'Pending - Pharmacy',
      FOREIGN KEY(consultation_id) REFERENCES consultations(id),
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS lab_orders (
      id TEXT PRIMARY KEY,
      consultation_id TEXT,
      patient_id TEXT,
      test_name TEXT,
      reason TEXT,
      status TEXT DEFAULT 'Pending - Lab',
      result TEXT,
      FOREIGN KEY(consultation_id) REFERENCES consultations(id),
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      icon TEXT DEFAULT '🏥',
      fields TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS department_records (
      id TEXT PRIMARY KEY,
      department_id TEXT,
      patient_id TEXT,
      consultation_id TEXT,
      data TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_id) REFERENCES departments(id),
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    );
  `);

  try {
      const countRow = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };
      if (countRow.count === 0) {
        db.exec(`
          INSERT INTO patients (id, name, age, gender, phone, medicalHistory) VALUES 
          ('P001', 'Rahul Sharma', 45, 'Male', '+91 9876543210', 'Hypertension, Type 2 Diabetes'),
          ('P002', 'Priya Patel', 32, 'Female', '+91 8765432109', 'Asthma (Mild), Penicillin Allergy');
        `);
      }
      // Seed default departments
      const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get() as { count: number };
      if (deptCount.count === 0) {
        db.exec(`
          INSERT INTO departments (id, name, description, icon, fields) VALUES
          ('DEPT_PHARMACY', 'Pharmacy', 'Dispenses prescriptions and medications', '💊', '["medication","dosage","frequency","duration","status"]'),
          ('DEPT_LAB', 'Laboratory', 'Conducts diagnostic tests and provides results', '🔬', '["test_name","reason","status","result"]'),
          ('DEPT_RADIOLOGY', 'Radiology', 'Imaging and diagnostic scans', '📡', '["scan_type","body_part","urgency","findings"]'),
          ('DEPT_PHYSIO', 'Physiotherapy', 'Rehabilitation and physical therapy', '🏃', '["condition","treatment_plan","sessions","progress"]');
        `);
      }
  } catch (e) {
      console.error(e);
  }
};

initDb();

export default db;
