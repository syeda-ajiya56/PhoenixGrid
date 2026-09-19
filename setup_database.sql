-- ============================================================================
-- PHOENIX GRID — Database Setup & Seeding Script
-- Microsoft SQL Server / SQL Server Management Studio (SSMS) Format
-- ============================================================================

-- 1. Create database if it does not exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PhoenixGrid')
BEGIN
    CREATE DATABASE PhoenixGrid;
END
GO

USE PhoenixGrid;
GO

-- 2. Drop existing foreign keys and tables to enable clean re-runs
IF OBJECT_ID('dbo.DispatchRecords', 'U') IS NOT NULL DROP TABLE dbo.DispatchRecords;
IF OBJECT_ID('dbo.SosRequests',     'U') IS NOT NULL DROP TABLE dbo.SosRequests;
IF OBJECT_ID('dbo.Edges',           'U') IS NOT NULL DROP TABLE dbo.Edges;
IF OBJECT_ID('dbo.EventsLog',       'U') IS NOT NULL DROP TABLE dbo.EventsLog;
IF OBJECT_ID('dbo.Entities',        'U') IS NOT NULL DROP TABLE dbo.Entities;
IF OBJECT_ID('dbo.Snapshots',       'U') IS NOT NULL DROP TABLE dbo.Snapshots;
IF OBJECT_ID('dbo.Nodes',           'U') IS NOT NULL DROP TABLE dbo.Nodes;
GO

-- 3. Create dbo.Nodes Table
CREATE TABLE dbo.Nodes (
    id NVARCHAR(50) NOT NULL PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    type NVARCHAR(50) NOT NULL, -- e.g., INTERSECTION, HOSPITAL, SAFE_ZONE, BUILDING
    status NVARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL', -- e.g., OPERATIONAL, DAMAGED, DESTROYED
    region_id NVARCHAR(50) NOT NULL
);
GO

-- 4. Create dbo.Edges Table
CREATE TABLE dbo.Edges (
    id NVARCHAR(50) NOT NULL PRIMARY KEY,
    source_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Nodes(id),
    destination_id NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES dbo.Nodes(id),
    distance FLOAT NOT NULL,
    travel_time FLOAT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL', -- e.g., OPERATIONAL, DANGEROUS, BLOCKED
    damage_level INT NOT NULL DEFAULT 0,
    region_id NVARCHAR(50) NOT NULL
);
GO

-- 5. Create dbo.Entities Table
CREATE TABLE dbo.Entities (
    id NVARCHAR(50) NOT NULL PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(50) NOT NULL, -- e.g., AMBULANCE, HOSPITAL, CITIZEN
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    state NVARCHAR(50) NOT NULL DEFAULT 'SAFE', -- e.g., SAFE, ASSISTING, UNDER_ATTACK, DISTRESS
    visible BIT NOT NULL DEFAULT 1,
    capacity INT NOT NULL DEFAULT 0, -- Beds for hospitals, crew for ambulances
    region_id NVARCHAR(50) NOT NULL
);
GO

-- 6. Create dbo.EventsLog Table
CREATE TABLE dbo.EventsLog (
    id NVARCHAR(50) NOT NULL PRIMARY KEY,
    type NVARCHAR(100) NOT NULL, -- e.g., BLAST, STATE_CHANGE, ROLLBACK
    entity_id NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    timestamp BIGINT NOT NULL,
    region_id NVARCHAR(50) NOT NULL,
    severity INT NOT NULL DEFAULT 1
);
GO

-- 7. Create dbo.Snapshots Table
CREATE TABLE dbo.Snapshots (
    id NVARCHAR(50) NOT NULL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    graph_state_json NVARCHAR(MAX) NOT NULL,
    region_id NVARCHAR(50) NOT NULL,
    label NVARCHAR(255) NOT NULL
);
GO

-- 8. Seed Default Regions Data (PAK & GAZA)
-- Seeding Nodes
INSERT INTO dbo.Nodes (id, name, latitude, longitude, type, status, region_id) VALUES
('PK-N1', 'Karachi Port', 24.8607, 67.0011, 'INTERSECTION', 'OPERATIONAL', 'PAK'),
('PK-N2', 'Lahore Civil Hosp', 31.5204, 74.3587, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('PK-N3', 'Islamabad Sector G', 33.7294, 73.0931, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),
('PK-N4', 'Peshawar Cantonment', 34.0151, 71.5249, 'BUILDING', 'DAMAGED', 'PAK'),
('PK-N5', 'Quetta Relief Camp', 30.1798, 66.9750, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),

('K1', 'Karachi Command HQ', 24.8607, 67.0011, 'COMMAND', 'OPERATIONAL', 'PAK'),
('K2', 'Jinnah Hospital (JPMC)', 24.8532, 67.0427, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('K3', 'Aga Khan Hospital', 24.8930, 67.0734, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('K4', 'Civil Hospital', 24.8615, 67.0084, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('K5', 'Saddar Intersection', 24.8580, 67.0200, 'INTERSECTION', 'OPERATIONAL', 'PAK'),
('K6', 'DHA Phase 5', 24.8050, 67.0550, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),
('K7', 'Gulshan-e-Iqbal', 24.9300, 67.0900, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),
('K8', 'Korangi Industrial', 24.8213, 67.1218, 'INTERSECTION', 'OPERATIONAL', 'PAK'),
('K9', 'Malir Cantonment', 24.8950, 67.1850, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),
('K10', 'SITE Area', 24.9000, 67.0150, 'FIRE_STATION', 'OPERATIONAL', 'PAK'),
('K11', 'Clifton Block 2', 24.8150, 67.0200, 'POLICE', 'OPERATIONAL', 'PAK'),
('K12', 'Liaquat National Hosp', 24.8935, 67.0750, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('K13', 'South City Hospital', 24.8140, 67.0250, 'HOSPITAL', 'OPERATIONAL', 'PAK'),
('K14', 'Shahrah-e-Faisal Police', 24.8620, 67.0700, 'POLICE', 'OPERATIONAL', 'PAK'),
('K15', 'Korangi Fire Brigade', 24.8300, 67.1200, 'FIRE_STATION', 'OPERATIONAL', 'PAK'),
('K16', 'Malir Cantt Police', 24.9000, 67.1900, 'POLICE', 'OPERATIONAL', 'PAK'),
('K17', 'Tariq Road (Civilian)', 24.8730, 67.0590, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),
('K18', 'Nazimabad Base', 24.9100, 67.0300, 'SAFE_ZONE', 'OPERATIONAL', 'PAK'),

('GZ-N1', 'Gaza City Hospital', 31.5017, 34.4668, 'HOSPITAL', 'DAMAGED', 'GAZA'),
('GZ-N2', 'Rafah Crossing', 31.2816, 34.2399, 'INTERSECTION', 'DAMAGED', 'GAZA'),
('GZ-N3', 'Khan Younis Camp', 31.3452, 34.3060, 'SAFE_ZONE', 'OPERATIONAL', 'GAZA'),
('GZ-N4', 'Jabalia Relief', 31.5326, 34.4833, 'BUILDING', 'DESTROYED', 'GAZA'),
('GZ-N5', 'Al-Shifa Medical', 31.5218, 34.4669, 'HOSPITAL', 'DESTROYED', 'GAZA');
GO

-- Seeding Edges
INSERT INTO dbo.Edges (id, source_id, destination_id, distance, travel_time, status, damage_level, region_id) VALUES
('PK-E1', 'PK-N1', 'PK-N2', 1200, 90, 'OPERATIONAL', 0, 'PAK'),
('PK-E2', 'PK-N2', 'PK-N3', 280, 25, 'OPERATIONAL', 0, 'PAK'),
('PK-E3', 'PK-N3', 'PK-N4', 170, 20, 'DANGEROUS', 45, 'PAK'),
('PK-E4', 'PK-N4', 'PK-N5', 530, 55, 'OPERATIONAL', 0, 'PAK'),

-- Karachi Intra-City Edges
('K_E1',  'K1',  'K4',  1.5,  4,  'OPERATIONAL', 0,  'PAK'),
('K_E2',  'K4',  'K5',  2.0,  5,  'OPERATIONAL', 0,  'PAK'),
('K_E3',  'K5',  'K2',  3.5,  8,  'OPERATIONAL', 0,  'PAK'),
('K_E4',  'K2',  'K6',  6.0,  12, 'OPERATIONAL', 0,  'PAK'),
('K_E5',  'K6',  'K11', 4.5,  10, 'OPERATIONAL', 0,  'PAK'),
('K_E6',  'K2',  'K3',  5.5,  11, 'OPERATIONAL', 0,  'PAK'),
('K_E7',  'K3',  'K7',  4.0,  9,  'OPERATIONAL', 0,  'PAK'),
('K_E8',  'K7',  'K9',  12.0, 20, 'OPERATIONAL', 0,  'PAK'),
('K_E9',  'K6',  'K8',  8.0,  18, 'DANGEROUS',   35, 'PAK'),
('K_E10', 'K1',  'K10', 6.5,  13, 'OPERATIONAL', 0,  'PAK'),
('K_E11', 'K10', 'K7',  10.0, 18, 'OPERATIONAL', 0,  'PAK'),
('K_E12', 'K3',  'K12', 0.5,  2,  'OPERATIONAL', 0,  'PAK'),
('K_E13', 'K11', 'K13', 1.2,  3,  'OPERATIONAL', 0,  'PAK'),
('K_E14', 'K2',  'K14', 3.0,  7,  'OPERATIONAL', 0,  'PAK'),
('K_E15', 'K8',  'K15', 2.0,  5,  'OPERATIONAL', 0,  'PAK'),
('K_E16', 'K9',  'K16', 1.5,  4,  'OPERATIONAL', 0,  'PAK'),
('K_E17', 'K5',  'K17', 4.0,  9,  'OPERATIONAL', 0,  'PAK'),
('K_E18', 'K10', 'K18', 3.5,  8,  'OPERATIONAL', 0,  'PAK'),

('GZ-E1', 'GZ-N1', 'GZ-N2', 25, 40, 'DANGEROUS', 80, 'GAZA'),
('GZ-E2', 'GZ-N2', 'GZ-N3', 8, 15, 'OPERATIONAL', 0, 'GAZA'),
('GZ-E3', 'GZ-N3', 'GZ-N4', 20, 30, 'BLOCKED', 100, 'GAZA'),
('GZ-E4', 'GZ-N4', 'GZ-N5', 3, 10, 'BLOCKED', 100, 'GAZA');
GO

-- Seeding initial Entities (Hospitals, Fire Brigades, Police, Ambulances)
INSERT INTO dbo.Entities (id, name, type, latitude, longitude, state, visible, capacity, region_id) VALUES
-- Hospitals (Karachi)
('E-H1',  'Jinnah Hospital (JPMC)',      'HOSPITAL',    24.8532, 67.0427, 'SAFE', 1, 750, 'PAK'),
('E-H2',  'Aga Khan University Hospital','HOSPITAL',    24.8930, 67.0734, 'SAFE', 1, 700, 'PAK'),
('E-H3',  'Civil Hospital Karachi',      'HOSPITAL',    24.8615, 67.0084, 'SAFE', 1, 1800,'PAK'),
('E-H4',  'Liaquat National Hospital',   'HOSPITAL',    24.8935, 67.0750, 'SAFE', 1, 500, 'PAK'),
('E-H5',  'South City Hospital',         'HOSPITAL',    24.8140, 67.0250, 'SAFE', 1, 250, 'PAK'),
('E-H6',  'National Medical Centre',     'HOSPITAL',    24.8700, 67.0600, 'SAFE', 1, 300, 'PAK'),
('E-H7',  'Indus Hospital Korangi',      'HOSPITAL',    24.8213, 67.1218, 'SAFE', 1, 400, 'PAK'),
-- Hospitals (Other Pakistan Cities)
('E-H8',  'Lahore Civil Hospital',       'HOSPITAL',    31.5204, 74.3587, 'SAFE', 1, 1500,'PAK'),
('E-H9',  'Shaukat Khanum Lahore',       'HOSPITAL',    31.4697, 74.2728, 'SAFE', 1, 300, 'PAK'),
('E-H10', 'PIMS Islamabad',              'HOSPITAL',    33.7050, 73.0603, 'SAFE', 1, 1000,'PAK'),
('E-H11', 'Hayatabad Medical Complex',   'HOSPITAL',    34.0105, 71.4745, 'SAFE', 1, 600, 'PAK'),
-- Fire Brigades
('E-F1',  'Karachi Fire Brigade HQ',     'FIRE_STATION',24.8600, 67.0200, 'SAFE', 1, 20,  'PAK'),
('E-F2',  'SITE Fire Station',           'FIRE_STATION',24.9000, 67.0150, 'SAFE', 1, 12,  'PAK'),
('E-F3',  'Gulshan Fire Station',        'FIRE_STATION',24.9300, 67.0900, 'SAFE', 1, 10,  'PAK'),
('E-F4',  'Korangi Fire Brigade',        'FIRE_STATION',24.8300, 67.1200, 'SAFE', 1, 10,  'PAK'),
('E-F5',  'Lahore Fire Brigade',         'FIRE_STATION',31.5500, 74.3400, 'SAFE', 1, 25,  'PAK'),
-- Police Stations
('E-P1',  'Clifton Police Station',      'POLICE',      24.8150, 67.0200, 'SAFE', 1, 80,  'PAK'),
('E-P2',  'Saddar Police Station',       'POLICE',      24.8580, 67.0200, 'SAFE', 1, 100, 'PAK'),
('E-P3',  'DHA Police Station',          'POLICE',      24.8050, 67.0550, 'SAFE', 1, 60,  'PAK'),
('E-P4',  'Shahrah-e-Faisal Police',     'POLICE',      24.8620, 67.0700, 'SAFE', 1, 90,  'PAK'),
('E-P5',  'Malir Cantt Police',          'POLICE',      24.9000, 67.1900, 'SAFE', 1, 70,  'PAK'),
('E-P6',  'Korangi Police Station',      'POLICE',      24.8213, 67.1218, 'SAFE', 1, 65,  'PAK'),
-- Ambulances (Karachi)
('E-A1',  'Edhi Ambulance (Saddar)',     'AMBULANCE',   24.8600, 67.0200, 'SAFE', 1, 4,   'PAK'),
('E-A2',  'Edhi Ambulance (Gulshan)',    'AMBULANCE',   24.9300, 67.0900, 'SAFE', 1, 4,   'PAK'),
('E-A3',  'Chhipa Ambulance (Clifton)', 'AMBULANCE',   24.8150, 67.0200, 'SAFE', 1, 4,   'PAK'),
('E-A4',  'Aman Foundation KHI',        'AMBULANCE',   24.8300, 67.0900, 'SAFE', 1, 4,   'PAK'),
('E-A5',  'Rescue 1122 Lahore',          'AMBULANCE',   31.5204, 74.3587, 'SAFE', 1, 4,   'PAK'),
-- Pakistan legacy
('PK-H1', 'Lahore Civil Hospital',       'HOSPITAL',    31.5204, 74.3587, 'SAFE', 1, 200, 'PAK'),
('PK-A1', 'Alpha-Karachi Ambulance',     'AMBULANCE',   24.8607, 67.0011, 'SAFE', 1, 4,   'PAK'),
('PK-C1', 'Civilian Peshawar',           'CITIZEN',     34.0151, 71.5249, 'DISTRESS', 1, 0, 'PAK'),
-- GAZA
('GZ-H1', 'Gaza City Hospital Unit',     'HOSPITAL',    31.5017, 34.4668, 'SAFE', 1, 150, 'GAZA'),
('GZ-A1', 'Rafah Rescue Ambulance',      'AMBULANCE',   31.2816, 34.2399, 'SAFE', 1, 4,   'GAZA'),
('GZ-C1', 'Distressed Citizen Jabalia',  'CITIZEN',     31.5326, 34.4833, 'DISTRESS', 1, 0, 'GAZA');
GO

-- ============================================================
-- 9.  SosRequests — permanent record of every SOS signal
-- ============================================================
IF OBJECT_ID('dbo.SosRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SosRequests (
        id           NVARCHAR(50)  NOT NULL PRIMARY KEY,
        type         NVARCHAR(50)  NOT NULL,                      -- earthquake/fire/medical…
        severity     NVARCHAR(20)  NOT NULL DEFAULT 'HIGH',       -- LOW/MEDIUM/HIGH/CRITICAL
        location     NVARCHAR(255) NOT NULL,
        phone        NVARCHAR(50)  NULL,
        description  NVARCHAR(MAX) NOT NULL,
        status       NVARCHAR(30)  NOT NULL DEFAULT 'pending',    -- pending/verified/dispatched/rejected
        submitted_by NVARCHAR(100) NOT NULL,
        lat          FLOAT         NOT NULL DEFAULT 0,
        lon          FLOAT         NOT NULL DEFAULT 0,
        created_at   DATETIME      NOT NULL DEFAULT GETDATE(),
        updated_at   DATETIME      NOT NULL DEFAULT GETDATE()
    );
    PRINT 'Created dbo.SosRequests';
END
GO

-- ============================================================
-- 10. DispatchRecords — permanent log of every unit dispatch
-- ============================================================
IF OBJECT_ID('dbo.DispatchRecords', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DispatchRecords (
        id           NVARCHAR(50)  NOT NULL PRIMARY KEY,
        sos_id       NVARCHAR(50)  NULL REFERENCES dbo.SosRequests(id),
        unit_id      NVARCHAR(100) NOT NULL,
        unit_name    NVARCHAR(255) NOT NULL,
        unit_type    NVARCHAR(50)  NOT NULL,
        zone         NVARCHAR(255) NOT NULL,
        eta          NVARCHAR(20)  NULL,
        dispatched_by NVARCHAR(100) NOT NULL,
        is_false_alarm BIT         NOT NULL DEFAULT 0,
        dispatched_at  DATETIME    NOT NULL DEFAULT GETDATE(),
        recalled_at    DATETIME    NULL
    );
    PRINT 'Created dbo.DispatchRecords';
END
GO

PRINT 'PHOENIX GRID Database Schema initialized and Seeded successfully!';
GO

GO
