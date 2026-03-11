import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TokenPage({ params }: { params: { tokenNumber: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const printJob = await prisma.printJob.findUnique({
    where: { tokenNumber: params.tokenNumber },
    include: {
      user: true,
    },
  });

  if (!printJob || printJob.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Smart Campus Printing</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">✓</div>
              <h2 className="text-2xl font-bold text-green-800">Payment Successful!</h2>
            </div>
            <p className="text-green-700">Your print job has been added to the queue.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h3 className="text-gray-600 mb-2">Your Token Number</h3>
              <div className="text-5xl font-bold text-blue-600 mb-4">
                {printJob.tokenNumber}
              </div>
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
                Position in Queue: {printJob.queuePosition}
              </div>
            </div>

            <div className="border-t border-b py-6 mb-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Document Name:</span>
                <span className="font-medium">{printJob.documentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Pages:</span>
                <span className="font-medium">{printJob.totalPages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sheets Required:</span>
                <span className="font-medium">{printJob.sheetsRequired}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Printing Cost:</span>
                <span className="font-medium">₹{printJob.printingCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Token Slip:</span>
                <span className="font-medium">₹{printJob.tokenCharge}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-600">Total Cost:</span>
                <span className="text-blue-600">₹{printJob.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Printer Location:</span>
                <span className="font-medium">{printJob.printerLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">{formatDate(printJob.createdAt)}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please note your token number and present it at the 
                printer location when collecting your prints.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/queue" className="flex-1">
                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
                  View Queue Status
                </button>
              </Link>
              <Link href="/dashboard" className="flex-1">
                <button className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
