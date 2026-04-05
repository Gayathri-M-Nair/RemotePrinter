import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, COLLECTIONS } from "@/lib/firebase";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get queue items with PENDING, IN_QUEUE, or PRINTING status
    const queueSnapshot = await db
      .collection(COLLECTIONS.QUEUE)
      .where('status', 'in', ['PENDING', 'IN_QUEUE', 'PRINTING'])
      .get();

    // Get user emails for each queue item
    const queueItems = await Promise.all(
      queueSnapshot.docs.map(async (doc) => {
        const queueData = doc.data();
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(queueData.userid).get();
        const userData = userDoc.data();

        return {
          id: doc.id,
          userid: queueData.userid,
          tocken: queueData.tocken,
          status: queueData.status,
          filename: queueData.filename,
          userEmail: userData?.email || 'Unknown',
        };
      })
    );

    return NextResponse.json({ queue: queueItems });
  } catch (error) {
    console.error("Fetch queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}