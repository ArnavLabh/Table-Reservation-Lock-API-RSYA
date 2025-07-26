# Table Reservation Lock API

## Overview
This is a Node.js/Express.js implementation of a Table Reservation Lock API that manages temporary table locks to prevent double bookings.

## Setup
1. Clone the repository: `git clone <repository-url>`
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server (or `npm run dev` for development with nodemon)

## Endpoints
1. **POST /api/tables/lock**
   - Locks a table for a specified duration
   - Body: `{ "tableId": string, "userId": string, "duration": number }`
   - Returns: `200 OK` with `{ "success": true, "message": "Table locked successfully.", "expiry": "<timestamp>" }`
   - Errors: `400` (invalid input), `409` (table already locked)

2. **POST /api/tables/unlock**
   - Unlocks a previously locked table
   - Body: `{ "tableId": string, "userId": string }`
   - Returns: `200 OK` with `{ "success": true, "message": "Table unlocked successfully" }`
   - Errors: `400` (invalid input), `403` (unauthorized), `404` (no lock)

3. **GET /api/tables/:tableId/status**
   - Checks if a table is currently locked
   - Returns: `200 OK` with `{ "isLocked": boolean }` or `{ "isLocked": true, "expiresAt": "<timestamp>", "remainingSeconds": number }` if locked
   - Errors: `400` (invalid tableId)

## Testing
1. Import the Postman collection (`TableReservationAPI.postman_collection.json`) into Postman.
2. Update the host/port if necessary (default: `http://localhost:3000`).
3. Run the following test scenarios:
   - **Lock and Status**: Lock a table, check status (expect `isLocked: true`).
   - **Unlock and Status**: Lock, unlock, check status (expect `isLocked: false`).
   - **No Lock**: Check status without locking (expect `isLocked: false`).
   - **Expired Lock**: Lock with short duration (e.g., 1s), wait, check status (expect `isLocked: false`).
   - **Conflict Lock**: Attempt to lock an already locked table (expect `409`).
   - **Unauthorized Unlock**: Attempt to unlock with wrong userId (expect `403`).
   - **Invalid Inputs**: Send malformed requests (expect `400`).
4. Test results are saved in the `/tests` folder (e.g., screenshots or JSON exports).

## Error Handling
- `400`: Invalid request body or tableId
- `403`: Unauthorized unlock attempt
- `404`: Lock not found or expired
- `409`: Table already locked