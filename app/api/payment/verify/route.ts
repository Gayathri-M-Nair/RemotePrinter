import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      printData,
    } = await req.json();

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get the first available printer (or you can implement printer selection)
    const printer = await prisma.printer.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!printer) {
      return NextResponse.json(
        { error: "No printer available" },
        { status: 400 }
      );
    }

    // Generate token number
    const lastJob = await prisma.printJob.findFirst({
      orderBy: { createdAt: "desc" },
    });

    const tokenNumber = lastJob
      ? `TOKEN-${String(parseInt(lastJob.tokenNumber.split("-")[1]) + 1).padStart(3, "0")}`
      : "TOKEN-001";

    // Calculate queue position
    const queuedJobs = await prisma.printJob.count({
      where: {
        printerId: printer.id,
        status: { in: ["QUEUED", "PRINTING"] },
      },
    });

    // Create print job
    const printJob = await prisma.printJob.create({
      data: {
        tokenNumber,
        userId: session.user.id,
        printerId: printer.id,
        fileName: printData.fileName,
        documentSheets: printData.documentSheets,
        tokenPage: 1,
        totalSheets: printData.documentSheets + 1, // +1 for token slip
        printingCost: printData.printingCost,
        tokenFee: 1,
        totalCost: printData.totalCost,
        preferences: printData.preferences,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        queuePosition: queuedJobs + 1,
        status: "QUEUED",
      },
      include: {
        printer: true,
      },
    });

    return NextResponse.json({
      success: true,
      printJob: {
        id: printJob.id,
        tokenNumber: printJob.tokenNumber,
        printerName: printJob.printer.name,
        printerLocation: printJob.printer.location,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
