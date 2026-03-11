# Debug Guide: Print Job Creation API

## Issue
The print job creation API was failing with a 500 error when calling `POST /api/print-jobs/create`.

## Root Cause
The NextAuth session callback was not including the user `id` in the session object, causing `session.user.id` to be undefined when trying to create a print job.

## Fixes Applied

### 1. Updated NextAuth Configuration (`lib/auth.ts`)
Added user ID to JWT token and session:

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;  // ✅ Added this
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session?.user) {
      session.user.id = token.id as string;  // ✅ Added this
      session.user.role = token.role as string;
    }
    return session;
  },
}
```

### 2. Updated TypeScript Definitions (`types/next-auth.d.ts`)
Added `id` to JWT interface:

```typescript
declare module "next-auth/jwt" {
  interface JWT {
    id: string;    // ✅ Added this
    role: string;
  }
}
```

### 3. Enhanced API Route Error Handling (`app/api/print-jobs/create/route.ts`)
Added comprehensive error handling and validation:

- ✅ Session validation with detailed error messages
- ✅ User ID existence check
- ✅ JSON parsing error handling
- ✅ Required field validation
- ✅ Detailed console logging for debugging
- ✅ Type conversion for numeric fields
- ✅ Proper error response with details

## Setup Instructions

### Step 1: Ensure Database is Up-to-Date
```bash
# Run migrations
npx prisma migrate dev --name add_print_job_queue

# Generate Prisma client
npx prisma generate
```

### Step 2: Verify Database Schema
Check that the `PrintJob` table exists with these fields:
- id (String, UUID)
- userId (String)
- documentName (String)
- totalPages (Int)
- sheetsRequired (Int)
- printType (String)
- colorMode (String)
- pagesPerSheet (Int)
- copies (Int)
- totalAmount (Float)
- tokenNumber (String, unique)
- queuePosition (Int)
- printerLocation (String)
- status (PrintStatus enum)
- createdAt (DateTime)
- updatedAt (DateTime)

### Step 3: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

### Step 4: Clear Browser Session
Since we updated the session structure, users need to log out and log back in:
1. Log out from the application
2. Clear browser cookies (optional but recommended)
3. Log back in

## Testing the Fix

### Test Flow:
1. **Login** as a student user
2. **Upload** a document at `/student/upload`
3. **Configure** preferences at `/student/print-preferences`
4. **Proceed** to payment at `/student/payment`
5. **Click** "Proceed to Payment" button
6. **Wait** for 1 second (simulated payment)
7. **Verify** redirect to `/dashboard/token/{tokenNumber}`

### Expected API Request:
```json
POST /api/print-jobs/create
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

### Expected API Response:
```json
{
  "success": true,
  "printJob": {
    "id": "uuid-here",
    "tokenNumber": "RP1001",
    "queuePosition": 1,
    "printerLocation": "Library Print Room"
  }
}
```

## Debugging Tips

### Check Terminal Logs
The API now logs detailed information:
```
Creating print job for user: <user-id>
Generated token number: RP1001
Queue position: 1
Print job created successfully: <job-id>
```

### Common Errors and Solutions

#### Error: "Unauthorized - Please login"
**Solution:** User is not logged in. Redirect to `/login`.

#### Error: "Invalid session - User ID missing"
**Solution:** User needs to log out and log back in to get updated session.

#### Error: "Missing required fields"
**Solution:** Check the request body. The error will list which fields are missing.

#### Error: Prisma error about missing table
**Solution:** Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

#### Error: "Invalid JSON in request body"
**Solution:** Check that the frontend is sending valid JSON.

### Verify Session in Browser Console
```javascript
// Check if session has user ID
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "user": {
    "id": "user-id-here",
    "email": "user@example.com",
    "name": "User Name",
    "role": "STUDENT"
  }
}
```

## Additional Validation

### Field Validation Rules:
- `documentName`: Required, non-empty string
- `totalPages`: Required, positive integer
- `sheetsRequired`: Required, positive integer
- `printType`: Required, "single" or "double"
- `colorMode`: Required, "color" or "blackwhite"
- `pagesPerSheet`: Required, positive integer (1, 2, 4, 6, 9, or 16)
- `copies`: Required, positive integer
- `totalAmount`: Required, non-negative number
- `printerLocation`: Required, non-empty string

### Token Number Generation:
- Format: `RP` + 4-digit number
- Example: `RP1001`, `RP1002`, `RP1003`
- Sequential, never reused
- Starts at `RP1001` if no previous jobs exist

### Queue Position Calculation:
- Counts jobs with status: PENDING, IN_QUEUE, or PRINTING
- New job position = active jobs count + 1
- Automatically recalculates when jobs complete

## Success Indicators

✅ No errors in terminal
✅ Print job created in database
✅ Token number generated (e.g., RP1001)
✅ Queue position assigned
✅ User redirected to token page
✅ Token page displays job details

## If Still Failing

1. Check terminal for detailed error logs
2. Verify database connection in `.env`
3. Ensure Prisma client is generated
4. Check that user is properly authenticated
5. Verify all required fields are being sent
6. Check browser network tab for request/response details
