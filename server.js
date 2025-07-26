const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// In-memory storage for locks
const tableLocks = new Map();

app.use(bodyParser.json());

// POST /api/tables/lock
app.post('/api/tables/lock', (req, res) => {
  const { tableId, userId, duration } = req.body;

  // Validate request body
  if (!tableId || !userId || !duration || isNaN(duration)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid required fields: tableId, userId, duration'
    });
  }

  // Check if table is already locked and not expired
  const existingLock = tableLocks.get(tableId);
  if (existingLock && existingLock.expiry > Date.now()) {
    return res.status(409).json({
      success: false,
      message: 'Table is currently locked by another user.'
    });
  }

  // Create new lock
  const expiry = Date.now() + (duration * 1000);
  tableLocks.set(tableId, { userId, expiry });

  res.status(200).json({
    success: true,
    message: 'Table locked successfully.'
  });
});

// POST /api/tables/unlock
app.post('/api/tables/unlock', (req, res) => {
  const { tableId, userId } = req.body;

  // Validate request body
  if (!tableId || !userId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: tableId, userId'
    });
  }

  const lock = tableLocks.get(tableId);
  
  // Check if lock exists and is not expired
  if (!lock || lock.expiry < Date.now()) {
    tableLocks.delete(tableId);
    return res.status(404).json({
      success: false,
      message: 'No active lock found for this table'
    });
  }

  // Verify userId matches
  if (lock.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Cannot unlock: User ID does not match lock owner'
    });
  }

  // Remove the lock
  tableLocks.delete(tableId);
  res.status(200).json({
    success: true,
    message: 'Table unlocked successfully'
  });
});

// GET /api/tables/:tableId/status
app.get('/api/tables/:tableId/status', (req, res) => {
  const { tableId } = req.params;
  
  const lock = tableLocks.get(tableId);
  const isLocked = lock && lock.expiry > Date.now();

  // Clean up expired lock
  if (lock && lock.expiry <= Date.now()) {
    tableLocks.delete(tableId);
  }

  res.status(200).json({
    isLocked
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});