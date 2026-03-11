import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No session found - Please login",
      });
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user?.id || "MISSING",
          name: session.user?.name || "MISSING",
          email: session.user?.email || "MISSING",
          role: session.user?.role || "MISSING",
        },
      },
      hasUserId: !!session.user?.id,
      message: session.user?.id 
        ? "✅ Session is valid with user ID" 
        : "❌ Session missing user ID - Please log out and log back in",
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Failed to verify session",
      details: error.message,
    }, { status: 500 });
  }
}
