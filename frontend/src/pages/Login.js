import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, Mail, User, Building } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    department: "CSE",
    year: "2",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.name) {
      setError("Please fill in all required fields");
      return;
    }
    
    const isAdmin = formData.role === "admin" || formData.email.toLowerCase().includes('admin');
    const isTeacher = formData.role === "teacher" || formData.email.toLowerCase().includes('teacher');
    
    let userRole = "student";
    if (isAdmin) userRole = "admin";
    else if (isTeacher) userRole = "teacher";

    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: `user_${formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}`,
          email: formData.email,
          name: formData.name,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
          role: userRole,
          department: formData.department,
          year: parseInt(formData.year) || 2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Login failed");
      }

      const user = await response.json();
      localStorage.setItem("dev_user", JSON.stringify(user));
      
      if (user.session_token) {
        localStorage.setItem("session_token", user.session_token);
      }
      
      if (userRole === "admin") navigate("/admin");
      else if (userRole === "teacher") navigate("/teacher");
      else navigate("/community");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-3">
              <GraduationCap size={26} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Welcome to CCCP
            </h1>
            <p className="text-gray-500 text-sm">
              Campus Connect Platform
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <User size={14} />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.name@campus.edu"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                required
              />
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                  <Building size={14} />
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="Mechanical">Mech</option>
                  <option value="Civil">Civil</option>
                  <option value="EEE">EEE</option>
                  <option value="AIML">AIML</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'student', label: 'Student', icon: '🎓' },
                  { id: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
                  { id: 'admin', label: 'Admin', icon: '⚙️' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-2.5 rounded-lg border-2 transition-all text-center ${
                      formData.role === role.id
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{role.icon}</span>
                    <span className="text-xs font-medium">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              New here?{" "}
              <Link to="/signup" className="text-amber-600 font-medium hover:text-amber-700 transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-4 flex items-center justify-center gap-4 text-gray-400 text-xs">
          <span>🔒 Secure</span>
          <span>•</span>
          <span>🎓 Verified</span>
          <span>•</span>
          <span>⚡ Instant</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
