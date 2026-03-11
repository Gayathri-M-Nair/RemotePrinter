import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const printJobs = await prisma.printJob.findMany({
      where: {
        status: {
          in: ["PENDING", "IN_QUEUE", "PRINTING"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            studentId: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ printJobs });
  } catch (error) {
    console.error("Fetch queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}
