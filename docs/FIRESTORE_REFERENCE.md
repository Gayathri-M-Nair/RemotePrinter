# Firestore Quick Reference Guide

This guide provides quick examples for common Firestore operations in this project.

## Import & Setup

```typescript
import { db, COLLECTIONS } from "@/lib/firebase";
```

## Common Operations

### 1. Create a Document

```typescript
// With auto-generated ID
const docRef = await db.collection(COLLECTIONS.USERS).add({
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
});
console.log("Created document with ID:", docRef.id);

// With custom ID
await db.collection(COLLECTIONS.USERS).doc("custom-id").set({
  name: "Jane Doe",
  email: "jane@example.com",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

### 2. Read a Single Document

```typescript
// By document ID
const docRef = db.collection(COLLECTIONS.USERS).doc(userId);
const doc = await docRef.get();

if (doc.exists) {
  const data = doc.data();
  console.log("User data:", data);
} else {
  console.log("No such document!");
}
```

### 3. Query Documents

```typescript
// Simple where query
const snapshot = await db
  .collection(COLLECTIONS.USERS)
  .where('email', '==', 'john@example.com')
  .get();

if (!snapshot.empty) {
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

// Multiple conditions (AND)
const snapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('userId', '==', userId)
  .where('status', '==', 'PENDING')
  .get();

// IN query (for OR-like behavior on same field)
const snapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('status', 'in', ['PENDING', 'IN_QUEUE', 'PRINTING'])
  .get();

// With ordering and limit
const snapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('status', '==', 'COMPLETED')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();
```

### 4. Update a Document

```typescript
// Update specific fields
await db.collection(COLLECTIONS.PRINT_JOBS).doc(jobId).update({
  status: 'PRINTING',
  updatedAt: new Date(),
});

// Set with merge (creates if doesn't exist, updates if exists)
await db.collection(COLLECTIONS.USERS).doc(userId).set({
  name: "Updated Name",
  updatedAt: new Date(),
}, { merge: true });
```

### 5. Delete a Document

```typescript
await db.collection(COLLECTIONS.PRINT_JOBS).doc(jobId).delete();
```

### 6. Count Documents

```typescript
const snapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('status', '==', 'PENDING')
  .get();

const count = snapshot.size;
console.log("Pending jobs:", count);
```

### 7. Get All Documents in Collection

```typescript
const snapshot = await db.collection(COLLECTIONS.USERS).get();

const users = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data(),
}));
```

### 8. Batch Operations

```typescript
const batch = db.batch();

// Update multiple documents
const jobs = await db.collection(COLLECTIONS.PRINT_JOBS)
  .where('status', '==', 'PENDING')
  .get();

jobs.forEach(doc => {
  batch.update(doc.ref, { status: 'CANCELLED' });
});

// Commit all operations
await batch.commit();
```

### 9. Transactions

```typescript
await db.runTransaction(async (transaction) => {
  // Read
  const jobRef = db.collection(COLLECTIONS.PRINT_JOBS).doc(jobId);
  const jobDoc = await transaction.get(jobRef);
  
  if (!jobDoc.exists) {
    throw new Error("Job not found");
  }
  
  const currentPosition = jobDoc.data().queuePosition;
  
  // Write
  transaction.update(jobRef, {
    queuePosition: currentPosition + 1,
    updatedAt: new Date(),
  });
});
```

## Working with Dates

```typescript
// Create with Date
const data = {
  name: "Test",
  createdAt: new Date(),
};

// Read and convert to ISO string for JSON responses
const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
const userData = {
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data().createdAt.toDate().toISOString(),
  updatedAt: doc.data().updatedAt.toDate().toISOString(),
};
```

## Joining Collections (Manual)

Since Firestore doesn't have native joins, you need to fetch related documents manually:

```typescript
// Get print jobs with user information
const printJobsSnapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('status', '==', 'PENDING')
  .get();

const printJobsWithUsers = await Promise.all(
  printJobsSnapshot.docs.map(async (doc) => {
    const jobData = doc.data();
    
    // Fetch related user document
    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(jobData.userId)
      .get();
    
    const userData = userDoc.data();
    
    return {
      id: doc.id,
      ...jobData,
      user: {
        name: userData?.name,
        email: userData?.email,
        studentId: userData?.studentId,
      },
    };
  })
);
```

## Error Handling

```typescript
try {
  const doc = await db
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get();
    
  if (!doc.exists) {
    return { error: "User not found" };
  }
  
  const userData = doc.data();
  return { success: true, data: userData };
  
} catch (error) {
  console.error("Firestore error:", error);
  return { error: "Database error" };
}
```

## Pagination

```typescript
// First page
const firstPage = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

const lastVisible = firstPage.docs[firstPage.docs.length - 1];

// Next page
const nextPage = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .orderBy('createdAt', 'desc')
  .startAfter(lastVisible)
  .limit(10)
  .get();
```

## Common Patterns in This Project

### Check for Unique Email
```typescript
const existingUserSnapshot = await db
  .collection(COLLECTIONS.USERS)
  .where('email', '==', email)
  .limit(1)
  .get();

if (!existingUserSnapshot.empty) {
  throw new Error("Email already exists");
}
```

### Generate Sequential Token Number
```typescript
const lastJobSnapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .orderBy('createdAt', 'desc')
  .limit(1)
  .get();

let tokenNumber = "RP1001";
if (!lastJobSnapshot.empty) {
  const lastJob = lastJobSnapshot.docs[0].data();
  if (lastJob.tokenNumber) {
    const lastNumber = parseInt(lastJob.tokenNumber.replace("RP", ""));
    tokenNumber = `RP${lastNumber + 1}`;
  }
}
```

### Calculate Queue Position
```typescript
const activeJobsSnapshot = await db
  .collection(COLLECTIONS.PRINT_JOBS)
  .where('status', 'in', ['PENDING', 'IN_QUEUE', 'PRINTING'])
  .get();

const queuePosition = activeJobsSnapshot.size + 1;
```

## TypeScript Types

```typescript
import type { User, PrintJob, PrintStatus, Role } from "@/lib/firebase";

// Use in your code
const printJob: PrintJob = {
  id: "job123",
  userId: "user123",
  documentName: "document.pdf",
  // ... other fields
};
```

## Performance Tips

1. **Use `.limit()`** when you only need a few documents
2. **Create indexes** for complex queries (Firestore will prompt you)
3. **Avoid large reads** - use pagination for large datasets
4. **Cache frequently accessed data** in your application
5. **Use batch operations** for multiple writes
6. **Minimize document reads** - fetch only what you need

## Limitations to Remember

- Maximum 1 MB per document
- Maximum 500 documents per batch write
- Limited `NOT`, `OR`, and `!=` operators
- `IN` queries limited to 10 comparison values
- Cannot order by multiple fields without a composite index
- Cannot filter on multiple different fields with `!=` or `NOT IN`
