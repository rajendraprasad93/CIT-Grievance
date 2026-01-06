import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const navigate = useNavigate();
  const [showDevLogin, setShowDevLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    department: "CSE",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + "/auth-callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(
      redirectUrl
    )}`;
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.name) {
      alert("Please fill in all fields");
      return;
    }
    
    const isAdmin = formData.role === "admin" || 
                    formData.email.toLowerCase().includes('admin') || 
                    formData.email.toLowerCase().endsWith('@admin.edu');
    
    const devUser = {
      user_id: `dev_${Date.now()}`,
      email: formData.email,
      name: formData.name,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      role: isAdmin ? "admin" : "student",
      department: formData.department,
      year: 2,
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("dev_user", JSON.stringify(devUser));
      const mockSession = `dev_session_${btoa(JSON.stringify(devUser)).substring(0, 32)}`;
      localStorage.setItem("session_token", mockSession);
      
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/community");
      }
    } catch (err) {
      console.error("Dev login error:", err);
      alert("Unable to complete dev login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cit-light px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded border border-gray-200 shadow-card p-8">
          <div className="text-center mb-8">
            <img 
              src="/cit-logo.png" 
              alt="CIT Chennai" 
              className="h-16 mx-auto mb-4"
            />
            <h1
              className="text-2xl font-heading font-bold text-cit-navy mb-2"
              data-testid="login-title"
            >
              CIT Campus Connect
            </h1>
            <p className="text-gray-600">
              Campus Civic & Community Platform
            </p>
          </div>

          {showDevLogin ? (
            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@campus.edu"
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                >
                  <option>CSE</option>
                  <option>ECE</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cit-navy mb-2">
                  Role (Dev Mode)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all flex items-center justify-center gap-2 shadow-button disabled:opacity-50"
                data-testid="dev-login-btn"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight size={20} />
              </button>

              <button
                type="button"
                onClick={() => setShowDevLogin(false)}
                className="w-full text-sm text-gray-500 hover:text-cit-gold"
              >
                Use Google instead
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all flex items-center justify-center gap-2 shadow-button"
                data-testid="google-login-btn"
              >
                Sign in with Google
                <ArrowRight size={20} />
              </button>

              <p className="text-sm text-gray-500 text-center">
                Use your campus email to access the platform
              </p>

              <button
                type="button"
                onClick={() => setShowDevLogin(true)}
                className="w-full text-sm text-gray-500 hover:text-cit-gold"
              >
                Use dev login instead
              </button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="text-cit-gold hover:text-cit-navy text-sm font-medium"
              data-testid="back-to-home"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
