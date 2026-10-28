-- ========================================================
-- Smart OWC Operations Monitoring and Management System (Shuchithwam)
-- Database Schema Definition (PostgreSQL / Relational)
-- Designed according to Synopsis ER Diagram (Figure 2)
-- Client: Rajeshree Enviro Solutions
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Roles: 'admin', 'supervisor', 'worker'
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'supervisor', 'worker')),
    phone VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    assigned_site_id VARCHAR(64),
    avatar_url TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SITES TABLE
-- OWC operational installations managed by Rajeshree Enviro Solutions
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    supervisor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Foreign key link for users assigned_site_id
ALTER TABLE users ADD CONSTRAINT fk_user_site FOREIGN KEY (assigned_site_id) REFERENCES sites(id) ON DELETE SET NULL;

-- 3. MACHINES TABLE
-- Organic Waste Converter (OWC) machinery installed at client sites
CREATE TABLE IF NOT EXISTS machines (
    id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    model VARCHAR(128) NOT NULL,
    serial_number VARCHAR(128) UNIQUE NOT NULL,
    rated_capacity_kg_hr DECIMAL(8, 2) NOT NULL, -- Rated processing capacity (e.g., 25 kg/hr, 50 kg/hr)
    total_runtime_hrs DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Captured by IoT or manual logs
    current_status VARCHAR(32) NOT NULL DEFAULT 'operational' CHECK (current_status IN ('operational', 'running', 'idle', 'maintenance', 'offline')),
    last_telemetry_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ATTENDANCE TABLE
-- Digital attendance records with GPS and photographic evidence
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    photo_ref TEXT NOT NULL, -- Photographic selfie evidence
    gps_lat DECIMAL(10, 7) NOT NULL,
    gps_long DECIMAL(10, 7) NOT NULL,
    gps_accuracy_m DECIMAL(6, 2),
    distance_from_site_m DECIMAL(8, 2),
    is_within_geofence BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')),
    attendance_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. WORK_REPORTS TABLE
-- Daily operational work reports submitted by workers via text or speech-to-text
CREATE TABLE IF NOT EXISTS work_reports (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    machine_id VARCHAR(64) REFERENCES machines(id) ON DELETE SET NULL,
    report_date DATE NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL, -- Reported waste quantity processed
    machine_runtime_hrs DECIMAL(6, 2) NOT NULL, -- Reported runtime
    expected_quantity_kg DECIMAL(10, 2) NOT NULL, -- Theoretical: rated_capacity * runtime
    discrepancy_flag BOOLEAN NOT NULL DEFAULT FALSE, -- Flagged if quantity > expected + tolerance
    discrepancy_notes TEXT,
    notes TEXT NOT NULL, -- Work description / observations
    voice_transcript TEXT, -- Web Speech API transcript
    activities JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of operational tasks
    photo_ref TEXT,
    gps_lat DECIMAL(10, 7),
    gps_long DECIMAL(10, 7),
    status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'flagged')),
    reviewer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. VISITS TABLE
-- Scheduled monthly supervisor site inspections and visit reminder tracking
CREATE TABLE IF NOT EXISTS visits (
    id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    supervisor_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'overdue')),
    observations TEXT,
    checklist JSONB, -- { machineCondition, workerHygiene, wasteSegregation, curingBay }
    evidence_photo_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. IOT_TELEMETRY TABLE
-- ESP32 machine telemetry for runtime tracking and sensor telemetry
CREATE TABLE IF NOT EXISTS iot_telemetry (
    id VARCHAR(64) PRIMARY KEY,
    machine_id VARCHAR(64) NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    site_id VARCHAR(64) NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_runtime_minutes INTEGER NOT NULL,
    motor_current_amps DECIMAL(6, 2) NOT NULL,
    power_kw DECIMAL(6, 2) NOT NULL,
    temperature_celsius DECIMAL(5, 2),
    is_running BOOLEAN NOT NULL DEFAULT TRUE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_site ON attendance(site_id);
CREATE INDEX IF NOT EXISTS idx_work_reports_site_date ON work_reports(site_id, report_date);
CREATE INDEX IF NOT EXISTS idx_work_reports_discrepancy ON work_reports(discrepancy_flag);
CREATE INDEX IF NOT EXISTS idx_visits_supervisor_status ON visits(supervisor_id, status);
CREATE INDEX IF NOT EXISTS idx_iot_machine_timestamp ON iot_telemetry(machine_id, timestamp);
