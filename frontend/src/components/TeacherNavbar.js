import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, LayoutDashboard, Users, MessageSquare, User, LogOut } from 'lucide-react';
import { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function TeacherNavbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

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
    <nav className="sticky top-0 z-50 bg-cit-navy shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/teacher" className="flex items-center gap-3">
              <img 
                src="/cit-logo.png" 
                alt="CIT Chennai" 
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <span className="font-heading text-xl font-bold text-white">CCCP</span>
                <span className="ml-2 px-2 py-0.5 bg-cit-gold text-cit-navy text-xs font-bold rounded">
                  TEACHER
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/teacher"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/teacher') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
              >
                DASHBOARD
              </Link>
              <Link
                to="/teacher/students"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/teacher/students') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
              >
                STUDENTS
              </Link>
              <Link
                to="/teacher/forum"
                className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
                  isActive('/teacher/forum') 
                    ? 'text-cit-gold border-cit-gold' 
                    : 'text-white border-transparent hover:text-cit-gold hover:border-cit-gold'
                }`}
              >
                FORUM
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              className="relative w-10 h-10 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-cit-gold text-cit-navy text-xs font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            
            {/* User Avatar */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                <div className="absolute right-0 mt-2 w-56 bg-white rounded border border-gray-200 shadow-card-hover py-2 animate-slide-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm text-cit-navy">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-cit-gold/20 text-cit-navy text-xs font-medium rounded">
                      Teacher
                    </span>
                  </div>
                  <Link
                    to={`/profile/${user?.user_id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <User size={18} className="text-cit-navy" />
                    <span className="font-medium text-gray-700">Profile</span>
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left text-red-600"
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

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-cit-navy border-t border-white/10 flex items-center justify-around py-2 z-50 shadow-nav">
        <Link to="/teacher" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/teacher') ? 'text-cit-gold' : 'text-white/70'}`}>
          <LayoutDashboard size={22} />
          <span className="text-xs font-medium">Dashboard</span>
        </Link>
        <Link to="/teacher/students" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/teacher/students') ? 'text-cit-gold' : 'text-white/70'}`}>
          <Users size={22} />
          <span className="text-xs font-medium">Students</span>
        </Link>
        <Link to="/teacher/forum" className={`flex flex-col items-center gap-1 p-2 transition-all ${isActive('/teacher/forum') ? 'text-cit-gold' : 'text-white/70'}`}>
          <MessageSquare size={22} />
          <span className="text-xs font-medium">Forum</span>
        </Link>
        <Link to={`/profile/${user?.user_id}`} className={`flex flex-col items-center gap-1 p-2 transition-all ${location.pathname.includes('/profile') ? 'text-cit-gold' : 'text-white/70'}`}>
          <User size={22} />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default TeacherNavbar;
