"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
    type: string;
    pages?: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
    const allowedTypes = ["pdf", "docx", "pptx"];

    if (!fileType || !allowedTypes.includes(fileType)) {
      alert("Only PDF, DOCX, and PPTX files are allowed");
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFileDetails({
          name: selectedFile.name,
          size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
          type: fileType.toUpperCase(),
          pages: data.pages,
        });

        // Store file info in sessionStorage for next page
        sessionStorage.setItem("uploadedFile", JSON.stringify({
          fileName: data.fileName,
          originalName: selectedFile.name,
          pages: data.pages,
          fileType: fileType,
        }));
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (fileDetails) {
      router.push("/student/print-preferences");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🖨️</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Campus Printing
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl shadow-2xl mb-4">
              <span className="text-6xl">📄</span>
            </div>
            <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Upload Document
            </h2>
            <p className="text-xl text-gray-600">
              Upload your document to get started with printing
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 animate-slide-in">
            <div className="border-3 border-dashed border-gradient-to-r from-blue-400 to-purple-600 rounded-2xl p-12 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:from-blue-100/50 hover:to-purple-100/50 transition-all duration-300">
              <div className="text-7xl mb-6 animate-float">📤</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">
                Choose a file to upload
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                <span className="font-semibold">Supported formats:</span> PDF, DOCX, PPTX
              </p>

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg disabled:opacity-70">
                  {uploading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    "📁 Select File"
                  )}
                </span>
              </label>
            </div>

            {fileDetails && (
              <div className="mt-8 p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 shadow-lg animate-slide-in">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">✅</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-2xl mb-4 text-green-800">
                      File Uploaded Successfully!
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/70 rounded-lg p-3">
                        <span className="text-gray-600 font-medium">📝 File Name:</span>
                        <span className="font-bold text-gray-800">{fileDetails.name}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/70 rounded-lg p-3">
                        <span className="text-gray-600 font-medium">💾 File Size:</span>
                        <span className="font-bold text-gray-800">{fileDetails.size}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/70 rounded-lg p-3">
                        <span className="text-gray-600 font-medium">📄 File Type:</span>
                        <span className="font-bold text-gray-800">{fileDetails.type}</span>
                      </div>
                      {fileDetails.pages && (
                        <div className="flex justify-between items-center bg-white/70 rounded-lg p-3">
                          <span className="text-gray-600 font-medium">📊 Total Pages:</span>
                          <span className="font-bold text-gray-800">{fileDetails.pages}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Continue to Print Preferences →
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
                </Button >
              </div >
            )}
          </div >
        </div >
      </main >
    </div >
  );
}
