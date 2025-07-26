# Table-Reservation-Lock-API-RSYA

## Overview
This is a Node.js/Express.js implementation of a Table Reservation Lock API that manages temporary table locks to prevent double bookings.

## Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server (or `npm run dev` for development with nodemon)

## Endpoints
1. **POST /api/tables/lock**
   - Locks a table for a specified duration
   - Body: `{ "tableId": string, "userId": string, "duration": number }`
   - Returns 200 on success, 409 if table is already locked

2. **POST /api/tables/unlock**
   - Unlocks a previously locked table
   - Body: `{ "tableId": string, "userId": string }`
   - Returns 200 on success, 403 if userId doesn't match

3. **GET /api/tables/:tableId/status**
   - Checks if a table is currently locked
   - Returns: `{ "isLocked": boolean }`

## Testing
1. Import the provided Postman collection (`TableReservationAPI.postman_collection.json`)
2. Update the host/port if necessary
3. Test the endpoints using the collection requests

## Error Handling
- 400: Invalid request body
- 403: Unauthorized unlock attempt
- 404: Lock not found
- 409: Table already locked