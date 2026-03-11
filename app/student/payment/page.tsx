"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function PaymentPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const TOKEN_CHARGE = 1; // ₹1 for token slip

  useEffect(() => {
    const storedSummary = sessionStorage.getItem("printSummary");
    const storedFile = sessionStorage.getItem("uploadedFile");
    const storedPrefs = sessionStorage.getItem("printPreferences");
    
    if (!storedSummary || !storedFile || !storedPrefs) {
      router.push("/student/upload");
      return;
    }
    
    setSummary(JSON.parse(storedSummary));
    setFileInfo(JSON.parse(storedFile));
    setPreferences(JSON.parse(storedPrefs));
  }, [router]);

  const handlePayment = async () => {
    if (!summary || !fileInfo || !preferences) return;

    setLoading(true);

    // Calculate total amount including token charge
    const printingCost = summary.cost;
    const totalAmount = printingCost + TOKEN_CHARGE;

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Create print job
        const response = await fetch("/api/print-jobs/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentName: fileInfo.originalName,
            totalPages: summary.totalPages,
            sheetsRequired: summary.sheets,
            printType: preferences.duplex === "double" ? "double" : "single",
            colorMode: preferences.colorMode === "color" ? "color" : "blackwhite",
            pagesPerSheet: preferences.pagesPerSheet,
            copies: preferences.copies,
            totalAmount: totalAmount,
            printerLocation: "Library Print Room",
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Clear session storage
          sessionStorage.removeItem("uploadedFile");
          sessionStorage.removeItem("printPreferences");
          sessionStorage.removeItem("printSummary");

          // Redirect to token page
          router.push(`/dashboard/token/${data.printJob.tokenNumber}`);
        } else {
          // Show detailed error message
          const errorMsg = data.error || "Failed to create print job";
          const details = data.details ? `\n\nDetails: ${data.details}` : "";
          const missingFields = data.missingFields ? `\n\nMissing fields: ${data.missingFields.join(", ")}` : "";
          
          alert(errorMsg + details + missingFields);
          console.error("API Error:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Payment error:", error);
        alert("An error occurred. Please try again.");
        setLoading(false);
      }
    }, 1000);
  };

  if (!summary) return null;

  const printingCost = summary.cost;
  const totalAmount = printingCost + TOKEN_CHARGE;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Smart Campus Printing</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Payment</h2>
          <p className="text-gray-600 mb-8">Review and confirm your order</p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Document:</span>
                <span className="font-medium">{fileInfo?.originalName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Pages:</span>
                <span className="font-medium">{summary.totalPages}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Sheets Required:</span>
                <span className="font-medium">{summary.sheets}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Color Mode:</span>
                <span className="font-medium capitalize">
                  {preferences?.colorMode === "bw" ? "Black & White" : "Color"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Print Type:</span>
                <span className="font-medium capitalize">
                  {preferences?.duplex === "double" ? "Double Sided" : "Single Sided"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Copies:</span>
                <span className="font-medium">{preferences?.copies}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Printing Cost:</span>
                <span className="font-medium">₹{printingCost}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Token Slip:</span>
                <span className="font-medium">₹{TOKEN_CHARGE}</span>
              </div>
              <div className="flex justify-between py-3 text-xl font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{totalAmount}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The token slip will be printed first and costs ₹1. 
                Please present it at the printer location to collect your prints.
              </p>
            </div>

            <Button 
              onClick={handlePayment} 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing Payment..." : `Pay ₹${totalAmount}`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
