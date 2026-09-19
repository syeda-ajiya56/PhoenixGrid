import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { poolPromise, sql } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Phoenix Grid Backend is running' });
});

// Mock Auth
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';
  res.json({ success: true, role, user: username, display: username });
});

app.post('/api/auth/signup', (req, res) => {
  const { username, displayName } = req.body;
  res.json({ success: true, role: 'user', user: username, display: displayName });
});

// Polling Sync Stub
app.post('/api/sync', (req, res) => {
  // Normally this would query all tables and send delta updates. 
  // We'll just echo back what we received, or return an empty structure so frontend doesn't break
  res.json({});
});

app.get('/api/sync', (req, res) => {
  res.json({});
});

// Endpoint to save SOS Requests
app.post('/api/sos', async (req, res) => {
  try {
    const { id, type, severity, location, phone, description, status, submittedBy, lat, lon } = req.body;
    
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('type', sql.NVarChar(50), type)
      .input('severity', sql.NVarChar(20), severity)
      .input('location', sql.NVarChar(255), location)
      .input('phone', sql.NVarChar(50), phone || null)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('status', sql.NVarChar(30), status || 'pending')
      .input('submitted_by', sql.NVarChar(100), submittedBy || 'system')
      .input('lat', sql.Float, lat || 0)
      .input('lon', sql.Float, lon || 0)
      .query(`
        INSERT INTO dbo.SosRequests (id, type, severity, location, phone, description, status, submitted_by, lat, lon, created_at, updated_at)
        VALUES (@id, @type, @severity, @location, @phone, @description, @status, @submitted_by, @lat, @lon, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, message: 'SOS Request saved successfully' });
  } catch (error) {
    console.error('Error saving SOS Request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update SOS Status
app.put('/api/sos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('status', sql.NVarChar(30), status)
      .query(`
        UPDATE dbo.SosRequests 
        SET status = @status, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ success: true, message: 'SOS status updated' });
  } catch (error) {
    console.error('Error updating SOS:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Endpoint to save Dispatch Records
app.post('/api/dispatch', async (req, res) => {
  try {
    const { id, sosId, unitId, unitName, unitType, zone, eta, dispatchedBy, isFalseAlarm } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.NVarChar(50), id)
      .input('sos_id', sql.NVarChar(50), sosId || null)
      .input('unit_id', sql.NVarChar(100), unitId)
      .input('unit_name', sql.NVarChar(255), unitName)
      .input('unit_type', sql.NVarChar(50), unitType)
      .input('zone', sql.NVarChar(255), zone)
      .input('eta', sql.NVarChar(20), eta || null)
      .input('dispatched_by', sql.NVarChar(100), dispatchedBy || 'system')
      .input('is_false_alarm', sql.Bit, isFalseAlarm ? 1 : 0)
      .query(`
        INSERT INTO dbo.DispatchRecords (id, sos_id, unit_id, unit_name, unit_type, zone, eta, dispatched_by, is_false_alarm, dispatched_at)
        VALUES (@id, @sos_id, @unit_id, @unit_name, @unit_type, @zone, @eta, @dispatched_by, @is_false_alarm, GETDATE())
      `);

    res.status(201).json({ success: true, message: 'Dispatch record saved successfully' });
  } catch (error) {
    console.error('Error saving Dispatch Record:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Recall Dispatch / Flag as false alarm
app.put('/api/dispatch/unit/:unitId/recall', async (req, res) => {
  try {
    const { unitId } = req.params;
    const { isFalseAlarm } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('unit_id', sql.NVarChar(100), unitId)
      .input('is_false_alarm', sql.Bit, isFalseAlarm ? 1 : 0)
      .query(`
        UPDATE dbo.DispatchRecords
        SET recalled_at = GETDATE(), is_false_alarm = @is_false_alarm
        WHERE unit_id = @unit_id AND recalled_at IS NULL
      `);

    res.json({ success: true, message: 'Unit recalled' });
  } catch (error) {
    console.error('Error recalling unit:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
