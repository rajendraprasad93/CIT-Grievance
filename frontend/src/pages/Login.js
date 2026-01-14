import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, GraduationCap, Mail, User, Building } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
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
    
    const userRole = formData.role;

    setLoading(true);
    
    try {
      // Check if user is trying to access a role that doesn't match their account type
      // Specific check for test credentials
      if (formData.email === 'admin@cit-campus-connect.test' && userRole !== 'admin') {
        throw new Error("Admin test account can only be used to login as admin");
      } else if (formData.email === 'teacher@cit-campus-connect.test' && userRole !== 'teacher') {
        throw new Error("Teacher test account can only be used to login as teacher");
      } else if (formData.email === 'student@cit-campus-connect.test' && userRole !== 'student') {
        throw new Error("Student test account can only be used to login as student");
      }
      
      // Prepare request body based on user role
      const requestBody = {
        user_id: `user_${formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString(36)}`,
        email: formData.email,
        name: formData.name,
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
        role: userRole,
      };
      
      // Add role-specific fields
      if (userRole === 'admin') {
        requestBody.department = 'Administration';
      } else if (userRole === 'teacher') {
        requestBody.department = 'Computer Science';
        requestBody.class_info = 'Computer Science Faculty';
      } else { // student
        requestBody.department = 'Computer Science';
        requestBody.section = 'A';
        requestBody.year = 2;
      }
      
      const response = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Login failed");
      }

      const user = await response.json();
      
      // Double-check user role matches what was requested
      if (user.role !== userRole) {
        throw new Error(`Access denied: Your account is registered as ${user.role}, but you're trying to login as ${userRole}`);
      }
      
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
            <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded-lg">
              <p className="mb-1 font-medium">Test Credentials:</p>
              <p>🔐 Admin: admin@cit-campus-connect.test</p>
              <p>👨‍🏫 Teacher: teacher@cit-campus-connect.test</p>
              <p>🎓 Student: student@cit-campus-connect.test</p>
            </div>
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
