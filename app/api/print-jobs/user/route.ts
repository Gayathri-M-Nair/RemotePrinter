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

    const queueSnapshot = await db
      .collection(COLLECTIONS.QUEUE)
      .where('userid', '==', session.user.id)
      .get();

    const queueItems = queueSnapshot.docs.map(doc => ({
      id: doc.id,
      userid: doc.data().userid,
      tocken: doc.data().tocken,
      status: doc.data().status,
      filename: doc.data().filename,
    }));

    return NextResponse.json({ queue: queueItems });
  } catch (error) {
    console.error("Fetch user queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue items" },
      { status: 500 }
    );
  }
}