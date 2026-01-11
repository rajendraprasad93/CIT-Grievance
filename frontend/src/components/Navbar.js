import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Bell, User, LogOut, Home, Zap, AlertCircle, 
  BookOpen, BarChart3, Settings, ChevronDown,
  Menu, X, GraduationCap
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { path: '/community', label: 'Home', icon: Home, emoji: '🏠' },
    { path: '/opportunities', label: 'Opportunities', icon: Zap, emoji: '💼' },
    { path: '/issues', label: 'Issues', icon: AlertCircle, emoji: '⚠️' },
  ];

  if (user?.role === 'student') {
    navItems.push({ path: '/my-class', label: 'My Class', icon: BookOpen, emoji: '📚' });
  }
  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin', icon: BarChart3, emoji: '⚙️' });
  }
  if (user?.role === 'teacher') {
    navItems.push({ path: '/teacher', label: 'Teacher', icon: BarChart3, emoji: '👨‍🏫' });
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/community" className="flex items-center gap-2.5 group" data-testid="logo-link">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-gray-900">CCCP</span>
                <span className="block text-[10px] text-gray-500 -mt-1 font-medium">Campus Connect</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-1.5">{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-500 text-sm transition-all"
              >
                <Search size={16} />
                <span>Search...</span>
              </button>

              {/* Mobile Search */}
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <Search size={18} className="text-gray-600" />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <Bell size={18} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-all"
                  data-testid="user-menu-button"
                >
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50 animate-scale-in" data-testid="user-dropdown">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.department} • Year {user?.year}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to={`/profile/${user?.user_id}`}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all text-sm"
                          onClick={() => setShowMenu(false)}
                        >
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-all text-sm"
                          onClick={() => setShowMenu(false)}
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100" />

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-all w-full text-sm"
                          data-testid="logout-button"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-slide-in">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />

      {/* Notification Panel */}
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Navbar;
