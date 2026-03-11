# Token + Queue Management System

## Overview
This document describes the token-based queue management system for the Smart Campus Printing project.

## Database Schema

### PrintJob Model
```prisma
model PrintJob {
  id              String      @id @default(uuid())
  userId          String
  documentName    String
  totalPages      Int
  sheetsRequired  Int
  printType       String      // "single" or "double"
  colorMode       String      // "color" or "blackwhite"
  pagesPerSheet   Int
  copies          Int
  totalAmount     Float
  tokenNumber     String      @unique
  queuePosition   Int
  printerLocation String
  status          PrintStatus @default(PENDING)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum PrintStatus {
  PENDING
  IN_QUEUE
  PRINTING
  COMPLETED
  COLLECTED
}
```

## Token Generation

Tokens follow the format: `RP1001`, `RP1002`, `RP1003`, etc.

Logic:
1. Find the last created print job
2. Extract the number from its token
3. Increment by 1
4. Format as `RP{number}`

## Queue Position Calculation

Queue position is determined by counting active jobs with status:
- PENDING
- IN_QUEUE
- PRINTING

New jobs are assigned: `activeJobs + 1`

## API Routes

### POST /api/print-jobs/create
Creates a new print job after payment simulation.

Request body:
```json
{
  "documentName": "document.pdf",
  "totalPages": 10,
  "sheetsRequired": 5,
  "printType": "double",
  "colorMode": "blackwhite",
  "pagesPerSheet": 2,
  "copies": 1,
  "totalAmount": 10,
  "printerLocation": "Library Print Room"
}
```

Response:
```json
{
  "success": true,
  "printJob": {
    "id": "uuid",
    "tokenNumber": "RP1001",
    "queuePosition": 1,
    "printerLocation": "Library Print Room"
  }
}
```

### GET /api/print-jobs/user
Returns current user's print jobs.

### GET /api/print-jobs/queue
Returns active queue (admin only).

### PATCH /api/print-jobs/update-status
Updates job status (admin only).

Request body:
```json
{
  "jobId": "uuid",
  "status": "PRINTING"
}
```

## User Flow

1. Upload document → `/student/upload`
2. Configure preferences → `/student/print-preferences`
3. Review and pay → `/student/payment`
4. Payment simulated (1 second delay)
5. Print job created
6. Redirect to token page → `/dashboard/token/{tokenNumber}`
7. Track status → `/dashboard/queue`

## Admin Flow

1. Access admin queue → `/admin/queue`
2. View all active jobs in table format
3. Update job status:
   - IN_QUEUE → Start Printing → PRINTING
   - PRINTING → Mark Completed → COMPLETED
   - COMPLETED → Mark Collected → COLLECTED

## Status Colors

- PENDING / IN_QUEUE: Yellow
- PRINTING: Blue
- COMPLETED: Green
- COLLECTED: Gray

## Auto-Refresh

- User queue page: Refreshes every 10 seconds
- Admin queue page: Refreshes every 5 seconds

## Estimated Wait Time

Calculation: `queuePosition × 2 minutes`

Example:
- Position 1: ~2 min
- Position 3: ~6 min
- Position 5: ~10 min

## Setup Instructions

1. Update Prisma schema:
```bash
npx prisma migrate dev --name add_print_job_queue
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Start development server:
```bash
npm run dev
```

## Testing

1. Register as a student
2. Upload a document
3. Configure print preferences
4. Complete payment (simulated)
5. View token number and queue position
6. Track status in queue page

For admin testing:
1. Create an admin user (update role in database)
2. Access `/admin/queue`
3. Manage print jobs

## Notes

- Payment is currently simulated (1 second delay)
- Razorpay integration can be added later
- Queue positions automatically recalculate when jobs complete
- Token numbers are sequential and never reused
