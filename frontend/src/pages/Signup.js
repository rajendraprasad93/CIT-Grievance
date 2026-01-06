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

    if (!formData.email.endsWith("@campus.edu") && !formData.email.includes("@")) {
      setError("Please use your campus email address");
      return;
    }

    if (!formData.name || !formData.department || !formData.year) {
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
          user_id: `user_${Date.now()}`,
          email: formData.email,
          name: formData.name,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          department: formData.department,
          year: parseInt(formData.year),
          hostel: formData.hostel || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Signup failed");
      }

      const user = await response.json();
      navigate("/community");
    } catch (err) {
      console.error("Signup error:", err);
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cit-light px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded border border-gray-200 shadow-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/cit-logo.png" 
              alt="CIT Chennai" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-heading font-bold text-cit-navy mb-2">
              Join CIT Campus Connect
            </h1>
            <p className="text-gray-600">
              Create your account to connect with your campus community
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-cit-navy mb-2 flex items-center gap-2">
                <User size={16} />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full h-11 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-cit-navy mb-2 flex items-center gap-2">
                <Mail size={16} />
                Campus Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.name@campus.edu"
                className="w-full h-11 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use your official campus email address
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2 flex items-center gap-2">
                  <Building size={16} />
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full h-11 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                  required
                >
                  <option value="">Select</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="IT">Information Tech</option>
                  <option value="EEE">Electrical</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2 flex items-center gap-2">
                  <GraduationCap size={16} />
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full h-11 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
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
              <label className="block text-sm font-semibold text-cit-navy mb-2 flex items-center gap-2">
                <Home size={16} />
                Hostel (Optional)
              </label>
              <select
                value={formData.hostel}
                onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                className="w-full h-11 px-4 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
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
              className="w-full h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all flex items-center justify-center gap-2 shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-cit-gold font-semibold hover:text-cit-navy">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-cit-gold hover:text-cit-navy text-sm font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
