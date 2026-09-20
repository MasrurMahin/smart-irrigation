-- Smart Irrigation System - PostgreSQL schema
--
-- Step 1:  createdb -U postgres smart_irrigation
-- Step 2:  psql -U postgres -d smart_irrigation -f database.sql

DROP TABLE IF EXISTS logs, readings, fields, users CASCADE;

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  email    VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE fields (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  crop        VARCHAR(50)  NOT NULL,
  area        NUMERIC(5,2) DEFAULT 1.00,
  threshold   INTEGER DEFAULT 35,                 -- irrigate below this moisture %
  pump_status VARCHAR(3) DEFAULT 'OFF' CHECK (pump_status IN ('ON','OFF'))
);

CREATE TABLE readings (
  id          SERIAL PRIMARY KEY,
  field_id    INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  moisture    NUMERIC(5,2) NOT NULL,
  temperature NUMERIC(5,2),
  humidity    NUMERIC(5,2),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
  id         SERIAL PRIMARY KEY,
  field_id   INTEGER NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  action     VARCHAR(5) NOT NULL CHECK (action IN ('START','STOP')),
  trigger_by VARCHAR(6) NOT NULL CHECK (trigger_by IN ('MANUAL','AUTO')),
  moisture   NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demo account: demo@demo.com / 123456
INSERT INTO users (name, email, password) VALUES
('Demo Farmer', 'demo@demo.com', '$2b$10$2ijF8fWkEIIiCpArayzGquDzKS4Z5YeXIZ9XhuZgfxogY/vLdgVPa');

INSERT INTO fields (user_id, name, crop, area, threshold) VALUES
(1, 'North Plot',    'Rice',   2.50, 45),
(1, 'Vegetable Bed', 'Tomato', 1.20, 35),
(1, 'South Plot',    'Wheat',  3.00, 30);

INSERT INTO readings (field_id, moisture, temperature, humidity) VALUES
(1, 52.0, 31.0, 70.0),
(2, 28.5, 33.0, 62.0),
(3, 41.0, 30.0, 66.0);
