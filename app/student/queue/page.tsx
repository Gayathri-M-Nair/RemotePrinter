import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db, COLLECTIONS } from "@/lib/firebase";
import Link from "next/link";

export default async function QueuePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const queueSnapshot = await db
    .collection(COLLECTIONS.QUEUE)
    .where('userid', '==', session.user.id)
    .get();

  const queueItems = queueSnapshot.docs.map(doc => {
    const data = doc.data() as { userid: string; tocken: string; status: string; filename: string };
    return {
      id: doc.id,
      ...data,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white";
      case "IN_QUEUE":
        return "bg-gradient-to-r from-blue-400 to-cyan-400 text-white";
      case "PRINTING":
        return "bg-gradient-to-r from-purple-400 to-pink-400 text-white";
      case "COMPLETED":
        return "bg-gradient-to-r from-green-400 to-emerald-400 text-white";
      case "COLLECTED":
        return "bg-gradient-to-r from-gray-400 to-slate-400 text-white";
      case "CANCELLED":
        return "bg-gradient-to-r from-red-400 to-pink-400 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-400 text-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return "⏳";
      case "IN_QUEUE":
        return "📋";
      case "PRINTING":
        return "🖨️";
      case "COMPLETED":
        return "✅";
      case "COLLECTED":
        return "📦";
      case "CANCELLED":
        return "❌";
      default:
        return "📄";
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-slide-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl shadow-2xl">
                <span className="text-5xl">📋</span>
              </div>
              <div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Print Queue
                </h2>
                <p className="text-xl text-gray-600 mt-2">Track all your print jobs</p>
              </div>
            </div>
          </div>

          {queueItems.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/20 animate-slide-in">
              <div className="text-8xl mb-6 animate-float">📭</div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800">No Print Jobs Yet</h3>
              <p className="text-gray-600 mb-8 text-lg">
                You haven't submitted any print jobs yet. Get started by uploading a document!
              </p>
              <Link
                href="/student/upload"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
              >
                📤 Upload Document
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg p-6 card-hover border border-white/20 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-5xl">{getStatusIcon(item.status)}</div>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-2">
                            Token: {item.tocken}
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                        <p className="text-gray-700 font-medium">
                          <span className="font-bold">📄 File:</span> {item.filename}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/student/token-slip/${item.id}`}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center font-semibold"
                      >
                        🎫 View Token Slip
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
