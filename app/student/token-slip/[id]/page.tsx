import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TokenSlipPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const printJob = await prisma.printJob.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      printer: true,
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-8">
        {/* Print Button */}
        <div className="mb-6 no-print">
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
              <p className="text-5xl font-bold">{printJob.tokenNumber}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Student Name:</span>
              <span>{printJob.user.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Student ID:</span>
              <span>{printJob.user.studentId || "N/A"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Printer Name:</span>
              <span>{printJob.printer.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Printer Location:</span>
              <span>{printJob.printer.location}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Document Sheets:</span>
              <span>{printJob.documentSheets}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Total Sheets:</span>
              <span>{printJob.totalSheets} (including token slip)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-semibold">Date & Time:</span>
              <span>{formatDate(printJob.createdAt)}</span>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-center">
              <strong>Queue Position:</strong> {printJob.queuePosition}
            </p>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Please present this token slip at the printer location</p>
            <p className="mt-2">Thank you for using Smart Campus Printing!</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
