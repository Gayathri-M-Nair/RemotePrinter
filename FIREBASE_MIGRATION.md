# Firebase Migration Complete

This project has been migrated from Prisma/PostgreSQL to Firebase Firestore.

## 🔧 Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing one)
3. Enable Firestore Database in the project

### 2. Get Firebase Admin SDK Credentials

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Download the JSON file containing your credentials

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**Important Notes:**
- Copy the `project_id`, `client_email`, and `private_key` from your downloaded JSON file
- Keep the quotes around `FIREBASE_PRIVATE_KEY` and ensure `\n` characters are preserved
- Generate a secure random string for `NEXTAUTH_SECRET` (use: `openssl rand -base64 32`)

### 4. Firestore Data Structure

The application uses two main collections:

#### **users** Collection
```
users/{userId}
  ├─ id: string
  ├─ name: string
  ├─ email: string (unique)
  ├─ password: string (hashed)
  ├─ role: "STUDENT" | "ADMIN"
  ├─ studentId?: string
  ├─ phone?: string
  ├─ createdAt: timestamp
  └─ updatedAt: timestamp
```

#### **printJobs** Collection
```
printJobs/{jobId}
  ├─ id: string
  ├─ userId: string
  ├─ documentName: string
  ├─ totalPages: number
  ├─ sheetsRequired: number
  ├─ printType: string ("single" | "double")
  ├─ colorMode: string ("color" | "blackwhite")
  ├─ pagesPerSheet: number
  ├─ copies: number
  ├─ printingCost: number
  ├─ tokenCharge: number
  ├─ totalAmount: number
  ├─ tokenNumber: string (unique, e.g., "RP1001")
  ├─ queuePosition: number
  ├─ printerLocation: string
  ├─ status: "PENDING" | "IN_QUEUE" | "PRINTING" | "COMPLETED" | "COLLECTED" | "CANCELLED"
  ├─ createdAt: timestamp
  └─ updatedAt: timestamp
```

### 5. Firestore Indexes (Required)

Create these composite indexes in Firestore Console:

1. **printJobs Collection:**
   - Fields: `status` (Ascending), `createdAt` (Ascending)
   - Fields: `userId` (Ascending), `createdAt` (Descending)

To create indexes:
- Go to Firebase Console > Firestore Database > Indexes
- Click "Create Index"
- Add the field combinations shown above

### 6. Security Rules (Recommended)

Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if true; // Allow registration
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Print jobs collection
    match /printJobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN');
      allow delete: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
  }
}
```

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Migration Notes

### What Changed:
1. ✅ Removed Prisma Client and all Prisma dependencies
2. ✅ Added Firebase Admin SDK
3. ✅ Replaced all database queries with Firestore queries
4. ✅ Updated authentication to use Firestore
5. ✅ Removed `prisma/` folder and migrations
6. ✅ Removed `lib/prisma.ts`
7. ✅ Created `lib/firebase.ts` with Firestore configuration

### Updated API Routes:
- ✅ `/api/auth/register` - User registration with Firestore
- ✅ `/api/auth/[...nextauth]/route` - NextAuth with Firestore
- ✅ `/api/print-jobs/create` - Create print jobs in Firestore
- ✅ `/api/print-jobs/queue` - Fetch queue from Firestore
- ✅ `/api/print-jobs/user` - Fetch user's print jobs from Firestore

### Data Migration:
If you have existing data in PostgreSQL, you'll need to:
1. Export your current data from PostgreSQL
2. Transform it to match Firestore structure
3. Import it into Firestore using Firebase Admin SDK or the Firebase Console

## 🔍 Key Differences from Prisma:

| Feature | Prisma | Firestore |
|---------|--------|-----------|
| Auto-increment IDs | ✅ | ❌ (Use auto-generated IDs) |
| Relations | ✅ Native | ❌ (Manual joins) |
| Transactions | ✅ | ✅ |
| Type Safety | ✅ Generated | ⚠️ Manual types |
| Complex Queries | ✅ | ⚠️ Limited |
| Scalability | Good | Excellent |
| Real-time Updates | ❌ | ✅ |

## 🆘 Troubleshooting

**Error: "Firebase Admin SDK not initialized"**
- Check that your `.env.local` file has all Firebase credentials
- Verify the `FIREBASE_PRIVATE_KEY` format (keep `\n` as `\n`, not actual newlines)

**Error: "Missing indexes"**
- Create the required composite indexes in Firestore Console
- Check the error message for specific index requirements

**Error: "Authentication failed"**
- Ensure `NEXTAUTH_SECRET` is set
- Clear browser cookies and try logging in again

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [NextAuth.js Documentation](https://next-auth.js.org/)
