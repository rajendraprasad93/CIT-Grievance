import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, AlertCircle, BarChart3, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/community" className="font-heading text-2xl font-bold text-primary" data-testid="logo-link">
              CCCP
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/community"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive('/community') ? 'text-accent' : 'text-foreground'
                }`}
                data-testid="nav-community"
              >
                COMMUNITY
              </Link>
              <Link
                to="/opportunities"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive('/opportunities') ? 'text-accent' : 'text-foreground'
                }`}
                data-testid="nav-opportunities"
              >
                OPPORTUNITIES
              </Link>
              <Link
                to="/issues"
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive('/issues') ? 'text-accent' : 'text-foreground'
                }`}
                data-testid="nav-issues"
              >
                TRACK ISSUES
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/report-issue"
              className="hidden md:inline-flex h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all items-center gap-2 shadow-sm"
              data-testid="nav-report-issue"
            >
              <AlertCircle size={16} />
              Report Issue
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                data-testid="user-menu-button"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-accent"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-border shadow-lg py-2" data-testid="user-dropdown">
                  <Link
                    to={`/profile/${user?.user_id}`}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary transition-colors"
                    onClick={() => setShowMenu(false)}
                    data-testid="nav-profile"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-secondary transition-colors w-full text-left text-destructive"
                    data-testid="logout-button"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around py-2 z-50">
        <Link to="/community" className={`flex flex-col items-center gap-1 p-2 ${isActive('/community') ? 'text-accent' : 'text-muted-foreground'}`}>
          <Users size={20} />
          <span className="text-xs">Community</span>
        </Link>
        <Link to="/opportunities" className={`flex flex-col items-center gap-1 p-2 ${isActive('/opportunities') ? 'text-accent' : 'text-muted-foreground'}`}>
          <Briefcase size={20} />
          <span className="text-xs">Opportunities</span>
        </Link>
        <Link to="/issues" className={`flex flex-col items-center gap-1 p-2 ${isActive('/issues') ? 'text-accent' : 'text-muted-foreground'}`}>
          <BarChart3 size={20} />
          <span className="text-xs">Issues</span>
        </Link>
        <Link to={`/profile/${user?.user_id}`} className={`flex flex-col items-center gap-1 p-2 ${location.pathname.includes('/profile') ? 'text-accent' : 'text-muted-foreground'}`}>
          <User size={20} />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;