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
  if (!tableId || typeof tableId !== 'string' || !userId || typeof userId !== 'string' || !duration || isNaN(duration)) {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid required fields: tableId (string), userId (string), duration (number)'
    });
  }

  // Validate duration is positive
  if (duration <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be a positive number'
    });
  }

  // Check and clean up expired lock
  const existingLock = tableLocks.get(tableId);
  if (existingLock && existingLock.expiry <= Date.now()) {
    tableLocks.delete(tableId);
    console.log(`Cleaned up expired lock for tableId: ${tableId}`);
  }

  // Check if table is already locked
  if (tableLocks.has(tableId)) {
    return res.status(409).json({
      success: false,
      message: 'Table is currently locked by another user.'
    });
  }

  // Create new lock
  const expiry = Date.now() + (duration * 1000);
  tableLocks.set(tableId, { userId, expiry });
  console.log(`Locked tableId: ${tableId} for userId: ${userId} until ${new Date(expiry).toISOString()}`);

  res.status(200).json({
    success: true,
    message: 'Table locked successfully.',
    expiry: new Date(expiry).toISOString()
  });
});

// POST /api/tables/unlock
app.post('/api/tables/unlock', (req, res) => {
  const { tableId, userId } = req.body;

  // Validate request body
  if (!tableId || typeof tableId !== 'string' || !userId || typeof userId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid required fields: tableId (string), userId (string)'
    });
  }

  const lock = tableLocks.get(tableId);

  // Check if lock exists and is not expired
  if (!lock || lock.expiry <= Date.now()) {
    tableLocks.delete(tableId);
    console.log(`No active lock found for tableId: ${tableId} or lock expired`);
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
  console.log(`Unlocked tableId: ${tableId} by userId: ${userId}`);

  res.status(200).json({
    success: true,
    message: 'Table unlocked successfully'
  });
});

// GET /api/tables/:tableId/status
app.get('/api/tables/:tableId/status', (req, res) => {
  const { tableId } = req.params;

  // Validate tableId
  if (!tableId || typeof tableId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid tableId: must be a string'
    });
  }

  const lock = tableLocks.get(tableId);
  const isLocked = !!(lock && lock.expiry > Date.now());

  // Clean up expired lock
  if (lock && lock.expiry <= Date.now()) {
    tableLocks.delete(tableId);
    console.log(`Cleaned up expired lock for tableId: ${tableId} during status check`);
  }

  // Always return isLocked
  const response = { isLocked };
  if (isLocked) {
    response.expiresAt = new Date(lock.expiry).toISOString();
    response.remainingSeconds = Math.ceil((lock.expiry - Date.now()) / 1000);
  }

  res.status(200).json(response);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});