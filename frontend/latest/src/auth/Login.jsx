
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "./auth.service";
import { useAuth } from "./auth.context";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginApi(username, password);
      login(data.token, data.user);

      if (data.user.role === "IT_ADMIN") {
        navigate("/it/dashboard");
      } else {
        navigate("/user/demandes");
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8f9fb] font-['Inter',sans-serif] text-[#191c1e]">

      {/* Decorative background elements */}
      <div className="fixed bottom-12 right-12 hidden lg:block opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[120px]">terminal</span>
      </div>
      <div className="fixed top-12 left-12 hidden lg:block opacity-10 pointer-events-none">
        <span className="material-symbols-outlined text-[120px]">grid_view</span>
      </div>

      {/* Branding */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="./src/assets/logoencc.png" alt="Logo" className="w-16 h-16" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tighter text-[#191c1e]">
          ENCC IT Service Desk
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(25,28,30,0.06)] overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#191c1e] mb-1">Welcome back</h2>
              <p className="text-sm text-[#414752]">
                Please enter your credentials to access the ledger.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 rounded-lg bg-[#ffdad6] text-[#93000a] text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-[#414752]"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#717783] text-lg group-focus-within:text-[#005dac] transition-colors">
                      person
                    </span>
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] placeholder:text-[#717783] focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all duration-200 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="block text-xs font-bold uppercase tracking-widest text-[#414752]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-xs font-semibold text-[#005dac] hover:text-[#1976d2] transition-colors"
                    href="#"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-[#717783] text-lg group-focus-within:text-[#005dac] transition-colors">
                      lock
                    </span>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3 bg-[#f2f4f6] border-0 rounded-lg text-[#191c1e] placeholder:text-[#717783] focus:ring-1 focus:ring-[#005dac] focus:bg-white transition-all duration-200 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#717783] hover:text-[#414752]"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-3.5 px-4 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #005dac 0%, #1976d2 100%)",
                  }}
                >
                  <span>{loading ? "Signing in..." : "Sign in"}</span>
                  {!loading && (
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  )}
                  {loading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="bg-[#f2f4f6] px-8 py-5 border-t border-[#c1c6d4]/20 text-center">
            <p className="text-sm text-[#414752] font-medium">
              Need an account?{" "}
              <a
                className="text-[#005dac] font-bold hover:underline decoration-2 underline-offset-4"
                href="#"
              >
                Contact IT Admin
              </a>
            </p>
          </div>
        </div>

      </div>

      {/* Material Icons CDN — add this to your index.html <head> if not already there */}
      {/* <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" /> */}
    </div>
  );
}