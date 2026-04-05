"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface FileInfo {
  fileName: string;
  originalName: string;
  pages: number;
  fileType: string;
}

export default function PrintPreferencesPage() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [preferences, setPreferences] = useState({
    pageRange: "all" as "all" | "custom",
    customRange: "",
    copies: 1,
    colorMode: "bw" as "bw" | "color",
    paperSize: "A4" as "A4" | "A3",
    pagesPerSheet: 1,
    orientation: "portrait" as "portrait" | "landscape",
    duplex: "single" as "single" | "double",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("uploadedFile");
    if (!stored) {
      router.push("/student/upload");
      return;
    }
    setFileInfo(JSON.parse(stored));
  }, [router]);

  const calculatePrintDetails = () => {
    if (!fileInfo) return { totalPages: 0, sheets: 0, cost: 0 };

    let totalPages = fileInfo.pages;

    if (preferences.pageRange === "custom" && preferences.customRange) {
      const ranges = preferences.customRange.split(",");
      totalPages = ranges.reduce((acc, range) => {
        if (range.includes("-")) {
          const [start, end] = range.split("-").map(Number);
          return acc + (end - start + 1);
        }
        return acc + 1;
      }, 0);
    }

    // Calculate pages per physical sheet based on duplex mode
    const pagesPerPhysicalSheet = preferences.duplex === "double"
      ? preferences.pagesPerSheet * 2
      : preferences.pagesPerSheet;

    // Calculate sheets required
    const sheets = Math.ceil(totalPages / pagesPerPhysicalSheet) * preferences.copies;

    // Calculate cost based on sheets
    const pricePerSheet = preferences.colorMode === "color" ? 5 : 2;
    const cost = sheets * pricePerSheet;

    return { totalPages, sheets, cost };
  };

  const { totalPages, sheets, cost } = calculatePrintDetails();
  const [loading, setLoading] = useState(false);

  const TOKEN_CHARGE = 1; // ₹1 for token slip

  const handleSubmit = async () => {
    if (!fileInfo) return;

    setLoading(true);

    try {
      // Create queue item with just filename
      const response = await fetch("/api/print-jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileInfo.originalName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear session storage
        sessionStorage.removeItem("uploadedFile");
        sessionStorage.removeItem("printPreferences");
        sessionStorage.removeItem("printSummary");

        // Redirect to token page
        router.push(`/dashboard/token/${data.queue.tocken}`);
      } else {
        alert(data.error || "Failed to create print job");
        console.error("API Error:", data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!fileInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Smart Campus Printing</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Print Preferences</h2>
          <p className="text-gray-600 mb-8">
            Configure your printing options
          </p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Preferences Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Document</h3>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="font-medium">{fileInfo.originalName}</p>
                    <p className="text-sm text-gray-600">{fileInfo.pages} pages</p>
                  </div>
                </div>
              </div>

              {/* Pages to Print */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Pages to Print</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pageRange"
                      checked={preferences.pageRange === "all"}
                      onChange={() => setPreferences({ ...preferences, pageRange: "all" })}
                      className="w-4 h-4"
                    />
                    <span>All Pages</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pageRange"
                      checked={preferences.pageRange === "custom"}
                      onChange={() => setPreferences({ ...preferences, pageRange: "custom" })}
                      className="w-4 h-4"
                    />
                    <span>Custom Range</span>
                  </label>
                  {preferences.pageRange === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g., 1-5, 8, 11-13"
                      value={preferences.customRange}
                      onChange={(e) => setPreferences({ ...preferences, customRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Copies */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Number of Copies</h3>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={preferences.copies}
                  onChange={(e) => setPreferences({ ...preferences, copies: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Color Mode */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Color Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, colorMode: "bw" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.colorMode === "bw"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="text-2xl mb-2">⚫</div>
                    <div className="font-medium">Black & White</div>
                    <div className="text-sm text-gray-600">₹2/sheet</div>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, colorMode: "color" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.colorMode === "color"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="font-medium">Color</div>
                    <div className="text-sm text-gray-600">₹5/sheet</div>
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Paper Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, paperSize: "A4" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.paperSize === "A4"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="font-medium">A4</div>
                    <div className="text-sm text-gray-600">210 × 297 mm</div>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, paperSize: "A3" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.paperSize === "A3"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="font-medium">A3</div>
                    <div className="text-sm text-gray-600">297 × 420 mm</div>
                  </button>
                </div>
              </div>

              {/* Pages Per Sheet */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Pages Per Sheet</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[1, 2, 4, 6, 9, 16].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPreferences({ ...preferences, pagesPerSheet: num })}
                      className={`p-3 border-2 rounded-lg font-medium transition-all ${preferences.pagesPerSheet === num
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Orientation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, orientation: "portrait" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.orientation === "portrait"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-medium">Portrait</div>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, orientation: "landscape" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.orientation === "landscape"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="text-2xl mb-2">📃</div>
                    <div className="font-medium">Landscape</div>
                  </button>
                </div>
              </div>

              {/* Duplex Printing */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Duplex Printing</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPreferences({ ...preferences, duplex: "single" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.duplex === "single"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="font-medium">Single Sided</div>
                  </button>
                  <button
                    onClick={() => setPreferences({ ...preferences, duplex: "double" })}
                    className={`p-4 border-2 rounded-lg transition-all ${preferences.duplex === "double"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="font-medium">Double Sided</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Print Summary - Sticky on Desktop */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="font-semibold text-lg mb-4">Print Summary</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Pages</span>
                      <span className="font-semibold">{totalPages}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Pages Per Sheet</span>
                      <span className="font-semibold">{preferences.pagesPerSheet}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Duplex Mode</span>
                      <span className="font-semibold capitalize">
                        {preferences.duplex === "single" ? "Single Sided" : "Double Sided"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Sheets Required</span>
                      <span className="font-semibold">{sheets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost</span>
                      <span className="font-bold text-2xl text-blue-600">₹{cost}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t">
                      <span className="text-gray-600">Token Slip Charge</span>
                      <span className="font-semibold">₹{TOKEN_CHARGE}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t">
                      <span className="text-gray-600 font-medium">Total Amount</span>
                      <span className="font-bold text-2xl text-green-600">₹{cost + TOKEN_CHARGE}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color Mode:</span>
                      <span className="font-medium">{preferences.colorMode === "bw" ? "B&W" : "Color"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paper Size:</span>
                      <span className="font-medium">{preferences.paperSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orientation:</span>
                      <span className="font-medium capitalize">{preferences.orientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Copies:</span>
                      <span className="font-medium">{preferences.copies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price/Sheet:</span>
                      <span className="font-medium">₹{preferences.colorMode === "color" ? 5 : 2}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? "Creating Print Job..." : "Submit Print Job"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
