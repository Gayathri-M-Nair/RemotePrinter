"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, COLLECTIONS } from "@/lib/firebase-client";
import { getDoc, doc } from "firebase/firestore";

export default function TokenSlipPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [queueItem, setQueueItem] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const queueDocRef = doc(db, COLLECTIONS.QUEUE, params.id);
        const queueDoc = await getDoc(queueDocRef);

        if (!queueDoc.exists()) {
          router.push("/dashboard");
          return;
        }

        const queueData = queueDoc.data();
        setQueueItem(queueData);

        // Get user email
        const userDocRef = doc(db, COLLECTIONS.USERS, queueData.userid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserEmail(userDoc.data().email);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading token slip:", error);
        router.push("/dashboard");
      }
    }

    loadData();
  }, [params.id, router]);

  if (loading || !queueItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-8">
        {/* Print Button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4"
          >
            Print Token Slip
          </button>
          <a
            href="/student/queue"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 inline-block"
          >
            View Queue
          </a>
        </div>

        {/* Token Slip */}
        <div className="border-4 border-dashed border-gray-800 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Smart Campus Printing</h1>
            <p className="text-gray-600">Token Slip</p>
          </div>

          <div className="border-t-2 border-b-2 border-gray-800 py-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Token Number</p>
              <p className="text-5xl font-bold">{queueItem.tocken}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Email:</span>
              <span>{userEmail || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">File Name:</span>
              <span>{queueItem.filename}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Status:</span>
              <span>{queueItem.status}</span>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-center">
              <strong>Current Status:</strong> {queueItem.status}
            </p>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Please present this token slip at the printer location</p>
            <p className="mt-2">Thank you for using Smart Campus Printing!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
