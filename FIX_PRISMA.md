# Fix Prisma Error: "Cannot read properties of undefined (reading 'findFirst')"

## Error Details
```
Failed to create print job
Details: Cannot read properties of undefined (reading 'findFirst')
```

## Root Cause
The Prisma client is not properly generated or the database migration hasn't been run.

## Solution

### Step 1: Stop the Development Server
Press `Ctrl + C` in your terminal to stop the Next.js server.

### Step 2: Delete Node Modules Lock Files (Windows Fix)
```bash
# Delete the Prisma client folder
Remove-Item -Recurse -Force node_modules\.prisma

# Or delete entire node_modules (if above doesn't work)
Remove-Item -Recurse -Force node_modules
```

### Step 3: Reinstall Dependencies (if you deleted node_modules)
```bash
npm install
```

### Step 4: Generate Prisma Client
```bash
npx prisma generate
```

### Step 5: Run Database Migration
```bash
npx prisma migrate dev --name init_print_jobs
```

This will:
- Create the database tables
- Apply the schema
- Generate the Prisma client

### Step 6: Verify Database
```bash
npx prisma studio
```

Check that these tables exist:
- ✅ User
- ✅ PrintJob

### Step 7: Restart Development Server
```bash
npm run dev
```

## Alternative: Quick Fix (If Above Doesn't Work)

### Option A: Reset Everything
```bash
# Stop server (Ctrl+C)

# Delete generated files
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.prisma

# Regenerate
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev

# Restart
npm run dev
```

### Option B: Manual Database Reset
```bash
# Stop server

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Apply migrations
npx prisma migrate dev --name init

# Generate client
npx prisma generate

# Restart server
npm run dev
```

## Verify the Fix

### Test 1: Check Prisma Client
Open Node REPL:
```bash
node
```

Then run:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log(prisma.printJob); // Should not be undefined
```

Press `Ctrl+C` twice to exit.

### Test 2: Check Database Connection
```bash
npx prisma db pull
```

Should show: "Introspected X models and wrote them into prisma/schema.prisma"

### Test 3: Try the Flow Again
1. Login
2. Upload document
3. Configure preferences
4. Click "Proceed to Payment"
5. Should work! ✅

## Common Issues

### Issue: "EPERM: operation not permitted"
**Solution:** Close all Node processes and try again:
```bash
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Then run prisma generate again
npx prisma generate
```

### Issue: "Database does not exist"
**Solution:** Create the database:
```bash
# Check your .env file has correct DATABASE_URL
# Then run:
npx prisma migrate dev
```

### Issue: "Table already exists"
**Solution:** Reset migrations:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

## Expected Terminal Output

After successful migration, you should see:
```
✔ Generated Prisma Client
✔ The migration has been created successfully
✔ Applied migration 20XX_init_print_jobs
```

## Test the Complete Flow

1. **Login** with your new account
2. **Upload** a document at `/student/upload`
3. **Configure** preferences at `/student/print-preferences`
4. **Click** "Proceed to Payment"
5. **Wait** 1 second
6. **Should redirect** to `/dashboard/token/RP1001`

## Check Server Logs

After the fix, you should see:
```
Creating print job for user: clxxx...
Generated token number: RP1001
Queue position: 1
Print job created successfully: ...
```

Instead of:
```
Cannot read properties of undefined (reading 'findFirst')
```
