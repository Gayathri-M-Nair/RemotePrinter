import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

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
            <a
              href="/api/auth/signout"
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Logout 👋
            </a>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12 animate-slide-up">
            <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome Back! 👋
            </h2>
            <p className="text-xl text-gray-600">{session.user?.email}</p>
          </div>

          {/* Account Info Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 mb-12 text-white animate-slide-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                <span className="text-4xl">👤</span>
              </div>
              <h3 className="text-3xl font-bold">Your Account</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">✉️</span>
                <div>
                  <p className="text-sm font-semibold text-white/80">Email</p>
                  <p className="font-bold text-lg">{session.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎭</span>
                <div>
                  <p className="text-sm font-semibold text-white/80">Role</p>
                  <p className="font-bold text-lg capitalize">{session.user?.role || 'Student'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Quick Actions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Upload Document Card */}
              <a href="/student/upload" className="group">
                <div className="bg-white rounded-2xl shadow-lg p-8 card-hover border-2 border-transparent hover:border-blue-400 transition-all duration-300">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl transition-all">
                      <span className="text-5xl">📄</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Upload Document</h3>
                    <p className="text-gray-600 mb-4">Upload your files for printing</p>
                    <div className="inline-flex items-center text-blue-600 font-semibold">
                      <span>Upload Now</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              {/* Print Queue Card */}
              <a href="/dashboard/queue" className="group">
                <div className="bg-white rounded-2xl shadow-lg p-8 card-hover border-2 border-transparent hover:border-purple-400 transition-all duration-300">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl transition-all">
                      <span className="text-5xl">📋</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Print Queue</h3>
                    <p className="text-gray-600 mb-4">Track all your print jobs</p>
                    <div className="inline-flex items-center text-purple-600 font-semibold">
                      <span>View Queue</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>

              {/* Print Preferences Card */}
              <a href="/student/print-preferences" className="group">
                <div className="bg-white rounded-2xl shadow-lg p-8 card-hover border-2 border-transparent hover:border-pink-400 transition-all duration-300">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl transition-all">
                      <span className="text-5xl">⚙️</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">Preferences</h3>
                    <p className="text-gray-600 mb-4">Set your print preferences</p>
                    <div className="inline-flex items-center text-pink-600 font-semibold">
                      <span>Configure</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Total Prints</p>
                  <p className="text-4xl font-bold">0</p>
                </div>
                <span className="text-5xl opacity-50">📊</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Pending Jobs</p>
                  <p className="text-4xl font-bold">0</p>
                </div>
                <span className="text-5xl opacity-50">⏳</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-1">Completed</p>
                  <p className="text-4xl font-bold">0</p>
                </div>
                <span className="text-5xl opacity-50">✅</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
