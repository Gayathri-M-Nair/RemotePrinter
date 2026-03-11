import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error("Unauthorized: No session found");
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Validate user ID exists in session
    if (!session.user.id) {
      console.error("Session missing user ID:", session);
      return NextResponse.json(
        { error: "Invalid session - User ID missing" },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const {
      documentName,
      totalPages,
      sheetsRequired,
      printType,
      colorMode,
      pagesPerSheet,
      copies,
      totalAmount,
      printerLocation,
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!documentName) missingFields.push("documentName");
    if (!totalPages) missingFields.push("totalPages");
    if (!sheetsRequired) missingFields.push("sheetsRequired");
    if (!printType) missingFields.push("printType");
    if (!colorMode) missingFields.push("colorMode");
    if (!pagesPerSheet) missingFields.push("pagesPerSheet");
    if (!copies) missingFields.push("copies");
    if (totalAmount === undefined || totalAmount === null) missingFields.push("totalAmount");
    if (!printerLocation) missingFields.push("printerLocation");

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          missingFields,
          received: body 
        },
        { status: 400 }
      );
    }

    console.log("Creating print job for user:", session.user.id);

    // Calculate costs
    const printingCost = parseFloat(totalAmount.toString()) - 1; // Subtract token charge
    const tokenCharge = 1;
    const finalTotalAmount = parseFloat(totalAmount.toString());

    // Generate token number
    const lastJob = await prisma.printJob.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let tokenNumber = "RP1001";
    if (lastJob && lastJob.tokenNumber) {
      const lastNumber = parseInt(lastJob.tokenNumber.replace("RP", ""));
      tokenNumber = `RP${lastNumber + 1}`;
    }

    console.log("Generated token number:", tokenNumber);

    // Calculate queue position (exclude COLLECTED jobs)
    const activeJobs = await prisma.printJob.count({
      where: {
        status: {
          in: ["PENDING", "IN_QUEUE", "PRINTING"],
        },
      },
    });

    const queuePosition = activeJobs + 1;
    console.log("Queue position:", queuePosition);

    // Create print job
    const printJob = await prisma.printJob.create({
      data: {
        userId: session.user.id,
        documentName,
        totalPages: parseInt(totalPages.toString()),
        sheetsRequired: parseInt(sheetsRequired.toString()),
        printType,
        colorMode,
        pagesPerSheet: parseInt(pagesPerSheet.toString()),
        copies: parseInt(copies.toString()),
        printingCost: printingCost,
        tokenCharge: tokenCharge,
        totalAmount: finalTotalAmount,
        tokenNumber,
        queuePosition,
        printerLocation,
        status: "IN_QUEUE",
      },
    });

    console.log("Print job created successfully:", printJob.id);

    return NextResponse.json({
      success: true,
      printJob: {
        id: printJob.id,
        tokenNumber: printJob.tokenNumber,
        queuePosition: printJob.queuePosition,
        printerLocation: printJob.printerLocation,
      },
    });
  } catch (error: any) {
    console.error("Print job creation error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create print job", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}
