import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

export const db = getFirestore();

// Collection names matching your Firebase structure
export const COLLECTIONS = {
    USERS: 'users',
    QUEUE: 'queue',
    ADMIN: 'admin',
} as const;

// Status types for queue
export type QueueStatus = 'PENDING' | 'IN_QUEUE' | 'PRINTING' | 'COMPLETED' | 'COLLECTED' | 'CANCELLED';

// User interface - matches your users collection
export interface User {
    id: string;
    email: string;
    pass: string; // stored as hashed password
}

// Queue interface - matches your queue collection
export interface QueueItem {
    id: string;
    userid: string; // reference to user id
    tocken: string; // token number
    status: QueueStatus;
    filename: string;
}

// Admin interface - matches your admin collection
export interface Admin {
    id: string;
    pass: string; // stored as hashed password
}