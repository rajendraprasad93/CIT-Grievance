import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Users, Briefcase, AlertCircle, BarChart3, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import NotificationPanel from './NotificationPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('dev_user');
      localStorage.removeItem('session_token');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-cit-navy shadow-nav" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/community" className="flex items-center gap-3" data-testid="logo-link">
              <img 
                src="/cit-logo.png" 
                alt="CIT Chennai" 
                className="h-10 w-auto"
              />
              <span className="font-heading text-xl font-bold text-white hidden sm:block">
                CCCP
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/community"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/community') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
                data-testid="nav-community"
              >
                COMMUNITY
              </Link>
              <Link
                to="/opportunities"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/opportunities') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
                data-testid="nav-opportunities"
              >
                OPPORTUNITIES
              </Link>
              <Link
                to="/issues"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/issues') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
                data-testid="nav-issues"
              >
                TRACK ISSUES
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                    isActive('/admin') 
                      ? 'text-cit-gold border-cit-gold' 
                      : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                  }`}
                  data-testid="nav-admin"
                >
                  ADMIN
                </Link>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-white" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cit-gold text-cit-navy text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            {/* User Avatar */}
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
                    className="w-10 h-10 rounded ring-2 ring-white/30 object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-cit-gold text-cit-navy flex items-center justify-center font-bold ring-2 ring-white/30">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded border border-gray-200 shadow-card-hover py-2 animate-slide-in" data-testid="user-dropdown">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-cit-navy">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to={`/profile/${user?.user_id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                    data-testid="nav-profile"
                  >
                    <User size={18} className="text-cit-navy" />
                    <span className="font-medium text-gray-700">Profile</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowMenu(false)}
                      data-testid="nav-admin-dropdown"
                    >
                      <BarChart3 size={18} className="text-cit-navy" />
                      <span className="font-medium text-gray-700">Admin Dashboard</span>
                    </Link>
                  )}
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left text-red-600"
                    data-testid="logout-button"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Notification Panel */}
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Mobile Bottom Nav - CIT Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cit-navy border-t border-white/10 flex items-center justify-around py-2 z-50 shadow-nav">
        <Link to="/community" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/community') ? 'text-cit-gold' : 'text-white/70'}`}>
          <Users size={22} />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/opportunities" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/opportunities') ? 'text-cit-gold' : 'text-white/70'}`}>
          <Briefcase size={22} />
          <span className="text-xs font-medium">Opps</span>
        </Link>
        <Link to="/issues" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/issues') ? 'text-cit-gold' : 'text-white/70'}`}>
          <BarChart3 size={22} />
          <span className="text-xs font-medium">Track</span>
        </Link>
        <Link to={`/profile/${user?.user_id}`} className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname.includes('/profile') ? 'text-cit-gold' : 'text-white/70'}`}>
          <User size={22} />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
