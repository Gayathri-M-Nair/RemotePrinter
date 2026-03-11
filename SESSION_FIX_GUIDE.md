# Session Fix Guide - User ID Missing

## Problem
The API `/api/print-jobs/create` fails with:
```
"Invalid session - User ID missing"
```

Session shows:
```json
{
  "user": {
    "name": "...",
    "email": "...",
    "id": undefined
  }
}
```

## Root Cause
The NextAuth configuration has been updated to include user ID in the session, but **existing sessions** were created before this change and don't have the user ID.

## ✅ Configuration is Already Fixed

The following files are already correctly configured:

### 1. `/lib/auth.ts` ✅
```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;      // ✅ Stores user ID in JWT
      token.role = user.role;
    }
    return token;
  },
  async session({ session, token }) {
    if (session?.user) {
      session.user.id = token.id as string;    // ✅ Adds ID to session
      session.user.role = token.role as string;
    }
    return session;
  },
}
```

### 2. `/types/next-auth.d.ts` ✅
```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;      // ✅ TypeScript knows about ID
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;        // ✅ JWT includes ID
    role: string;
  }
}
```

### 3. `/app/api/print-jobs/create/route.ts` ✅
```typescript
// ✅ Uses session.user.id correctly
const printJob = await prisma.printJob.create({
  data: {
    userId: session.user.id,  // ✅ Gets ID from session
    // ... other fields
  },
});
```

## 🔧 Solution: Refresh Your Session

Since the configuration is correct, you just need to get a fresh session:

### Option 1: Log Out and Log Back In (Recommended)
1. Click "Log Out" in the application
2. Go to `/login`
3. Log in again with your credentials
4. Your new session will include the user ID

### Option 2: Clear Browser Cookies
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Delete cookies for `localhost:3000`
4. Refresh the page
5. Log in again

### Option 3: Clear All Site Data
1. Open browser DevTools (F12)
2. Go to Application → Storage
3. Click "Clear site data"
4. Refresh and log in again

## 🧪 Verify the Fix

### Method 1: Use the Verification API
Open your browser and navigate to:
```
http://localhost:3000/api/auth/verify-session
```

**Expected Response (Success):**
```json
{
  "authenticated": true,
  "session": {
    "user": {
      "id": "clxxx...",
      "name": "Your Name",
      "email": "your@email.com",
      "role": "STUDENT"
    }
  },
  "hasUserId": true,
  "message": "✅ Session is valid with user ID"
}
```

**If Still Broken:**
```json
{
  "authenticated": true,
  "session": {
    "user": {
      "id": "MISSING",
      "name": "Your Name",
      "email": "your@email.com",
      "role": "STUDENT"
    }
  },
  "hasUserId": false,
  "message": "❌ Session missing user ID - Please log out and log back in"
}
```

### Method 2: Check in Browser Console
Open browser console and run:
```javascript
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => {
    console.log('Session:', data);
    console.log('Has User ID:', !!data.user?.id);
  });
```

**Expected Output:**
```javascript
Session: {
  user: {
    id: "clxxx...",      // ✅ Should have a value
    name: "Your Name",
    email: "your@email.com",
    role: "STUDENT"
  }
}
Has User ID: true
```

## 🚀 Test the Complete Flow

After logging out and back in:

1. **Upload Document**
   - Go to `/student/upload`
   - Upload a PDF/DOCX/PPTX file
   - Should show file details

2. **Configure Preferences**
   - Go to `/student/print-preferences`
   - Select options (color, pages, etc.)
   - Should show cost calculation

3. **Complete Payment**
   - Go to `/student/payment`
   - Click "Proceed to Payment"
   - Wait 1 second (simulated payment)

4. **Verify Success**
   - Should redirect to `/dashboard/token/RP1001`
   - Should show token number and queue position
   - Check terminal logs for:
     ```
     Creating print job for user: clxxx...
     Generated token number: RP1001
     Queue position: 1
     Print job created successfully: ...
     ```

## 🐛 Still Not Working?

### Check 1: Verify Database User ID Format
```bash
npx prisma studio
```
- Open the `User` table
- Check that user IDs exist and are strings (e.g., `clxxx...`)

### Check 2: Verify Prisma Schema
The User model should have:
```prisma
model User {
  id        String     @id @default(cuid())  // ✅ Must be cuid()
  // ... other fields
}
```

### Check 3: Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Check 4: Check Terminal Logs
When you log in, you should see the authorize function return:
```javascript
{
  id: "clxxx...",
  email: "user@example.com",
  name: "User Name",
  role: "STUDENT"
}
```

### Check 5: Verify NextAuth Route
Ensure `/app/api/auth/[...nextauth]/route.ts` uses the correct config:
```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## 📝 Summary

**The configuration is correct.** You just need to:

1. ✅ Log out from the application
2. ✅ Log back in
3. ✅ Test the upload → payment → token flow

The new session will include `session.user.id` and the print job creation will work.

## 🆘 Emergency Reset

If nothing works, try this complete reset:

```bash
# 1. Stop the server
# Press Ctrl+C

# 2. Clear Next.js cache
rm -rf .next

# 3. Regenerate Prisma client
npx prisma generate

# 4. Restart server
npm run dev
```

Then:
1. Clear browser cookies
2. Log in again
3. Test the flow
