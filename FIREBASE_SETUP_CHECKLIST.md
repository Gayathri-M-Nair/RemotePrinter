# 🔥 Firebase Setup Checklist

Use this checklist to complete your Firebase migration setup.

## ☐ Step 1: Create Firebase Project

- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add Project" or select existing project
- [ ] Name your project (e.g., "smart-campus-printing")
- [ ] Enable/disable Google Analytics (optional)
- [ ] Click "Create Project"

## ☐ Step 2: Enable Firestore

- [ ] In your Firebase project, click "Firestore Database" in left menu
- [ ] Click "Create database"
- [ ] Choose **"Start in production mode"** (we'll add custom rules later)
- [ ] Select a location (choose closest to your users, e.g., "asia-south1" for India)
- [ ] Click "Enable"

## ☐ Step 3: Get Service Account Credentials

- [ ] Click the gear icon (⚙️) → "Project settings"
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Click "Generate key" in the confirmation dialog
- [ ] Save the downloaded JSON file securely (don't commit to git!)

## ☐ Step 4: Configure Environment Variables

- [ ] In your project root, create `.env.local` file
- [ ] Copy content from `.env.local.example`
- [ ] Open the downloaded JSON file from Step 3
- [ ] Copy values to `.env.local`:
  - `project_id` → `FIREBASE_PROJECT_ID`
  - `client_email` → `FIREBASE_CLIENT_EMAIL`
  - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n`)
- [ ] Generate `NEXTAUTH_SECRET`:
  ```bash
  # On Windows PowerShell:
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  
  # On Linux/Mac:
  openssl rand -base64 32
  ```

**Example .env.local:**
```env
FIREBASE_PROJECT_ID=smart-campus-printing-abc123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@smart-campus-printing-abc123.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(your key here)...SHORTSTRING\n-----END PRIVATE KEY-----\n"
NEXTAUTH_SECRET=abc123def456ghi789jkl012mno345pq
NEXTAUTH_URL=http://localhost:3000
```

## ☐ Step 5: Create Firestore Indexes

Indexes are required for complex queries. Create them now to avoid errors:

- [ ] Go to Firebase Console → Firestore Database → Indexes tab
- [ ] Click "Create index"
- [ ] Create Index 1:
  - Collection: `printJobs`
  - Field 1: `status` → Ascending
  - Field 2: `createdAt` → Ascending
  - Query scope: Collection
  - Click "Create"
- [ ] Create Index 2:
  - Collection: `printJobs`
  - Field 1: `userId` → Ascending
  - Field 2: `createdAt` → Descending
  - Query scope: Collection
  - Click "Create"
- [ ] Wait for indexes to build (usually takes 1-2 minutes)

## ☐ Step 6: Set Firestore Security Rules

Protect your database with proper security rules:

- [ ] Go to Firebase Console → Firestore Database → Rules tab
- [ ] Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone can create (for registration)
      allow create: if true;
      
      // Users can read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can update their own data
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
    
    // Print jobs collection
    match /printJobs/{jobId} {
      // All authenticated users can read
      allow read: if isAuthenticated();
      
      // Authenticated users can create print jobs
      allow create: if isAuthenticated();
      
      // Users can update their own jobs, admins can update any
      allow update: if isAuthenticated() && 
                      (resource.data.userId == request.auth.uid || isAdmin());
      
      // Only admins can delete
      allow delete: if isAdmin();
    }
  }
}
```

- [ ] Click "Publish"

## ☐ Step 7: Install Dependencies

- [ ] Open terminal in project directory
- [ ] Run: `npm install`
- [ ] Verify Firebase packages are installed:
  ```bash
  npm list firebase firebase-admin
  ```
  Should show:
  ```
  ├── firebase-admin@13.7.0
  └── firebase@11.10.0
  ```

## ☐ Step 8: Test the Application

- [ ] Start development server: `npm run dev`
- [ ] Open browser to `http://localhost:3000`
- [ ] Test user registration:
  - Go to `/register`
  - Create a test account
  - Check Firestore Console → users collection for new document
- [ ] Test login:
  - Login with test account
  - Check for successful authentication
- [ ] Test print job creation:
  - Upload a document
  - Create a print job
  - Check Firestore Console → printJobs collection
  - Verify queue shows the job

## ☐ Step 9: Verify in Firebase Console

- [ ] Check Firestore Database has collections:
  - `users` - should have your test user
  - `printJobs` - should have any test jobs you created
- [ ] Check that indexes show "Enabled" status
- [ ] Review security rules are active

## 🎉 Migration Complete!

Once all checkboxes are marked, your migration is complete!

## 📋 Post-Migration Cleanup

Optional cleanup tasks:

- [ ] Remove old PostgreSQL database configuration
- [ ] Update any deployment scripts/configs
- [ ] Add `.env.local` to `.gitignore` (should already be there)
- [ ] Document Firebase setup for your team
- [ ] Set up Firebase in production environment
- [ ] Configure Firebase App Check for security (optional)
- [ ] Set up Firebase monitoring and alerts (optional)

## 🆘 If Something Goes Wrong

**Can't connect to Firestore?**
1. Check `.env.local` values are correct
2. Ensure `FIREBASE_PRIVATE_KEY` has `\n` as literal characters, not actual newlines
3. Restart your dev server after changing `.env.local`

**"Missing Index" errors?**
1. Click the error link in console - it will create the index for you
2. Or manually create indexes as shown in Step 5
3. Wait for indexes to build (check Firebase Console)

**Authentication not working?**
1. Verify `NEXTAUTH_SECRET` is set
2. Clear browser cookies/cache
3. Check NextAuth configuration in `lib/auth.ts`

**Need help?**
- Check [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md) for detailed docs
- Check [FIRESTORE_REFERENCE.md](docs/FIRESTORE_REFERENCE.md) for code examples
- Review [Firebase Documentation](https://firebase.google.com/docs/firestore)

---

**Remember:** Firebase is a cloud service, so make sure you have internet connection during development and production!
