import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    // Estimate pages based on file type and size
    const fileType = file.name.split(".").pop()?.toLowerCase();
    let estimatedPages = 1;

    if (fileType === "pdf") {
      // Simple estimation: ~50KB per page for PDF
      estimatedPages = Math.max(1, Math.ceil(file.size / 51200));
    } else if (fileType === "docx") {
      // Simple estimation: ~30KB per page for DOCX
      estimatedPages = Math.max(1, Math.ceil(file.size / 30720));
    } else if (fileType === "pptx") {
      // Simple estimation: ~100KB per slide for PPTX
      estimatedPages = Math.max(1, Math.ceil(file.size / 102400));
    }

    return NextResponse.json({
      success: true,
      fileName,
      pages: estimatedPages,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
