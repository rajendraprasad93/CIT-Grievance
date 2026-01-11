import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, User, Building, GraduationCap, Home } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    year: "",
    hostel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.department || !formData.year) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: `user_${formData.email.split('@')[0]}_${Date.now().toString(36)}`,
          email: formData.email,
          name: formData.name,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`,
          role: "student",
          department: formData.department,
          year: parseInt(formData.year),
          hostel: formData.hostel || null,
        }),
      });

      if (!response.ok) throw new Error("Signup failed");

      const user = await response.json();
      localStorage.setItem("dev_user", JSON.stringify(user));
      if (user.session_token) localStorage.setItem("session_token", user.session_token);
      navigate("/community");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Campus Connect</h1>
            <p className="text-gray-500 text-sm">Create your account to connect with your campus community</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User size={14} />Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail size={14} />Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.name@email.com"
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building size={14} />Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Select</option>
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="EEE">EEE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <GraduationCap size={14} />Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Home size={14} />Hostel (Optional)
              </label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              >
                <option value="">Select if applicable</option>
                <option value="A-Block">A-Block</option>
                <option value="B-Block">B-Block</option>
                <option value="C-Block">C-Block</option>
                <option value="D-Block">D-Block</option>
                <option value="Day Scholar">Day Scholar</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 px-6 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              ) : (
                <>Create Account<ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700">Sign In</Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-amber-600 hover:text-amber-700 text-sm font-medium">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
