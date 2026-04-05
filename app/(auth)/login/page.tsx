"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isDark, setIsDark] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.error || "Registration failed");
        return;
      }

      // Switch to login tab after successful registration
      setActiveTab("login");
      setEmail(registerData.email);
    } catch (error) {
      setRegisterError("An error occurred. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${isDark
        ? 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]'
        : 'bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100'
      }`}>
      <div className="w-full max-w-md md:max-w-lg">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-white text-gray-700'
              } hover:scale-110 transition-all`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Auth Card */}
        <div className={`rounded-3xl shadow-2xl overflow-hidden ${isDark
            ? 'bg-gradient-to-b from-[#1a1a2e]/95 to-[#16213e]/95 backdrop-blur-xl border border-white/10'
            : 'bg-white/95 backdrop-blur-xl border border-gray-200'
          }`}>
          {/* Tabs */}
          <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "login"
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${activeTab === "register"
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                  : isDark
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-10">
            {activeTab === "login" ? (
              <>
                {/* Login Form */}
                <div className="mb-8">
                  <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Welcome Back
                  </h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sign in to continue your journey
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                    <div className="text-right mt-2">
                      <a href="#" className="text-sm text-blue-500 hover:text-blue-400">
                        Forgot Password?
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Register Form */}
                <div className="mb-8">
                  <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Create Account
                  </h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Join Smart Campus Printing
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-5">
                  {registerError && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm">
                      {registerError}
                    </div>
                  )}

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="John Doe"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="hello@example.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="••••••••"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      placeholder="+1 234 567 8900"
                      required
                      className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${isDark
                          ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                        }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                  >
                    {registerLoading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
