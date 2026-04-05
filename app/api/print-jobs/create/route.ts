import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, COLLECTIONS } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "Invalid session - User ID missing" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        {
          error: "Missing required field: filename"
        },
        { status: 400 }
      );
    }

    // Generate token number
    const lastQueueSnapshot = await db
      .collection(COLLECTIONS.QUEUE)
      .orderBy('tocken', 'desc')
      .limit(1)
      .get();

    let tokenNumber = "RP1001";
    if (!lastQueueSnapshot.empty) {
      const lastQueue = lastQueueSnapshot.docs[0].data();
      if (lastQueue.tocken) {
        const lastNumber = parseInt(lastQueue.tocken.replace("RP", ""));
        tokenNumber = `RP${lastNumber + 1}`;
      }
    }

    // Create queue item
    const queueData = {
      userid: session.user.id,
      tocken: tokenNumber,
      status: "PENDING",
      filename: filename,
    };

    const queueRef = await db.collection(COLLECTIONS.QUEUE).add(queueData);

    return NextResponse.json({
      success: true,
      queue: {
        id: queueRef.id,
        tocken: tokenNumber,
        status: "PENDING",
        filename: filename,
      },
    });
  } catch (error: any) {
    console.error("Queue creation error:", error);

    return NextResponse.json(
      {
        error: "Failed to create queue item",
        details: error.message,
      },
      { status: 500 }
    );
  }
}