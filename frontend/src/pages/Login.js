import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Login() {
  const navigate = useNavigate();
  const [showDevLogin, setShowDevLogin] = useState(true); // Development mode
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    department: "CSE",
  });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Production: redirect to external auth
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
    // Static dev login (no backend) - store user in localStorage for MVP
    const devUser = {
      user_id: `dev_${Date.now()}`,
      email: formData.email,
      name: formData.name,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      role: "student",
      department: formData.department,
      year: 2,
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("dev_user", JSON.stringify(devUser));
      // Create a mock session token for API calls
      const mockSession = `dev_session_${btoa(JSON.stringify(devUser)).substring(0, 32)}`;
      localStorage.setItem("session_token", mockSession);
      navigate("/community");
    } catch (err) {
      console.error("Dev login error:", err);
      alert("Unable to complete dev login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1
              className="text-3xl font-heading font-bold text-primary mb-2"
              data-testid="login-title"
            >
              CCCP
            </h1>
            <p className="text-muted-foreground">
              Campus Civic & Community Platform
            </p>
          </div>

          {showDevLogin ? (
            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@campus.edu"
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                >
                  <option>CSE</option>
                  <option>ECE</option>
                  <option>Mechanical</option>
                  <option>Civil</option>
                  <option>Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                data-testid="dev-login-btn"
              >
                {loading ? "Signing in..." : "Sign In (Dev Mode)"}
                <ArrowRight size={20} />
              </button>

              <button
                type="button"
                onClick={() => setShowDevLogin(false)}
                className="w-full text-sm text-muted-foreground hover:text-accent"
              >
                Use Google instead
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full h-12 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                data-testid="google-login-btn"
              >
                Sign in with Google
                <ArrowRight size={20} />
              </button>

              <p className="text-sm text-muted-foreground text-center">
                Use your campus email to access the platform
              </p>

              <button
                type="button"
                onClick={() => setShowDevLogin(true)}
                className="w-full text-sm text-muted-foreground hover:text-accent"
              >
                Use dev login instead
              </button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border">
            <Link
              to="/"
              className="text-accent hover:underline text-sm"
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
