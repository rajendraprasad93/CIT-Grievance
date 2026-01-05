import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

function Login() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/community';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-primary mb-2" data-testid="login-title">CCCP</h1>
            <p className="text-muted-foreground">Campus Civic & Community Platform</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full h-12 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
              data-testid="google-login-btn"
            >
              Sign in with Google
              <ArrowRight size={20} />
            </button>
            
            <p className="text-sm text-muted-foreground text-center">
              Use your campus email to access the platform
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link to="/" className="text-accent hover:underline text-sm" data-testid="back-to-home">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;