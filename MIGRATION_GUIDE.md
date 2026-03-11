# Database Migration Guide

## Current Issue
If you're seeing errors about missing tables or columns, you need to run database migrations.

## Quick Fix

Run these commands in order:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Create and apply migration
npx prisma migrate dev --name add_print_job_queue

# 3. Restart your development server
npm run dev
```

## What This Does

### Step 1: Generate Prisma Client
- Creates TypeScript types from your schema
- Updates the Prisma client with latest models
- Required after any schema changes

### Step 2: Create Migration
- Compares your Prisma schema with the database
- Creates SQL migration files
- Applies changes to your PostgreSQL database
- Creates the `PrintJob` table if it doesn't exist

### Step 3: Restart Server
- Loads the new Prisma client
- Applies updated session handling
- Ensures all changes are active

## Verify Migration Success

### Check Database Tables
```bash
npx prisma studio
```

This opens a GUI where you can verify:
- ✅ `User` table exists
- ✅ `PrintJob` table exists with all fields
- ✅ Enums are created (Role, PrintStatus)

### Check Prisma Client
```bash
npx prisma validate
```

Should output: "The schema is valid ✔"

## Expected Database Schema

### User Table
```sql
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" DEFAULT 'STUDENT',
  "studentId" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### PrintJob Table
```sql
CREATE TABLE "PrintJob" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "documentName" TEXT NOT NULL,
  "totalPages" INTEGER NOT NULL,
  "sheetsRequired" INTEGER NOT NULL,
  "printType" TEXT NOT NULL,
  "colorMode" TEXT NOT NULL,
  "pagesPerSheet" INTEGER NOT NULL,
  "copies" INTEGER NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "tokenNumber" TEXT UNIQUE NOT NULL,
  "queuePosition" INTEGER NOT NULL,
  "printerLocation" TEXT NOT NULL,
  "status" "PrintStatus" DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id")
);
```

### Enums
```sql
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE "PrintStatus" AS ENUM ('PENDING', 'IN_QUEUE', 'PRINTING', 'COMPLETED', 'COLLECTED');
```

## Troubleshooting

### Error: "Can't reach database server"
**Solution:** Check your `.env` file has correct database credentials:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/smart_campus_printing"
```

### Error: "Migration failed"
**Solution:** Reset the database (WARNING: deletes all data):
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Error: "Prisma Client not found"
**Solution:** Generate the client:
```bash
npx prisma generate
```

### Error: "Table already exists"
**Solution:** The migration system is out of sync. Reset:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

## After Migration

### Required Actions:
1. ✅ Restart development server
2. ✅ Log out and log back in (to get updated session)
3. ✅ Test the upload → payment → token flow

### Verify Everything Works:
```bash
# Check Prisma client is working
npx prisma studio

# Check migrations are applied
npx prisma migrate status
```

## Production Deployment

When deploying to production:

```bash
# Don't use migrate dev in production
# Use migrate deploy instead
npx prisma migrate deploy
```

This applies pending migrations without prompting for input.
