import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Radar, TrendingUp, Target, Users, Clock, 
  Sparkles, ChevronRight, Zap, BookOpen, Calendar,
  MapPin, Star, ExternalLink
} from 'lucide-react';

function CampusRadar({ user }) {
  const [activeTab, setActiveTab] = useState('trending');

  // Simulated data - in real app, this comes from backend
  const trendingNow = [
    { id: 1, text: 'DBMS group study', count: 18, emoji: '📚', hot: true },
    { id: 2, text: 'WiFi outage Hostel C', count: 45, emoji: '⚠️', hot: true },
    { id: 3, text: 'Weekend movie night', count: 12, emoji: '🎬' },
    { id: 4, text: 'Placement prep tips', count: 28, emoji: '💼' },
  ];

  const recommendedForYou = [
    { id: 1, title: 'AI Internship at Zoho', type: 'opportunity', deadline: '3 days left', icon: '🚀' },
    { id: 2, title: 'Hackathon registrations', type: 'event', deadline: 'Ends tomorrow', icon: '💻' },
    { id: 3, title: 'Free AWS Workshop', type: 'workshop', deadline: 'This Saturday', icon: '☁️' },
  ];

  const studentsNearYou = [
    { id: 1, name: 'Priya S.', dept: 'AIML', status: 'online', activity: 'Studying ML' },
    { id: 2, name: 'Rohit K.', dept: 'CSE', status: 'online', activity: 'In Library' },
    { id: 3, name: 'Ananya R.', dept: 'CSE', status: 'away', activity: 'Lab session' },
  ];

  const yourCampusToday = {
    classes: 2,
    announcements: 1,
    pendingIssues: 1,
    closingOpportunities: 2
  };

  return (
    <div className="space-y-4">
      {/* Campus Radar Header */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Radar size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Campus Radar</h3>
            <p className="text-xs text-white/60">What's happening now</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-white/10 rounded-lg">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'trending' 
                ? 'bg-amber-500 text-gray-900' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setActiveTab('foryou')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'foryou' 
                ? 'bg-amber-500 text-gray-900' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            🎯 For You
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'nearby' 
                ? 'bg-amber-500 text-gray-900' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            👥 Nearby
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {activeTab === 'trending' && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">Trending Right Now</span>
            </div>
            <div className="space-y-2">
              {trendingNow.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-all group text-left"
                >
                  <span className="text-xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500">{item.count} students talking</p>
                  </div>
                  {item.hot && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                      HOT
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'foryou' && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Target size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">Recommended For You</span>
            </div>
            <div className="space-y-2">
              {recommendedForYou.map((item) => (
                <Link
                  key={item.id}
                  to="/opportunities"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-all group"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-rose-500 font-medium">{item.deadline}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-900">Students Near You</span>
            </div>
            <div className="space-y-2">
              {studentsNearYou.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-all group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      student.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.dept} • {student.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Your Campus Today */}
      <div className="bg-gradient-to-br from-amber-100/50 to-amber-50/30 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-amber-500" />
          <h3 className="font-heading font-bold text-gray-900">Your Campus Today</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-900" />
              <span className="text-lg font-bold text-gray-900">{yourCampusToday.classes}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">classes today</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-amber-500" />
              <span className="text-lg font-bold text-gray-900">{yourCampusToday.announcements}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">announcements</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-rose-500" />
              <span className="text-lg font-bold text-gray-900">{yourCampusToday.pendingIssues}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">pending issues</p>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              <span className="text-lg font-bold text-gray-900">{yourCampusToday.closingOpportunities}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">closing soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusRadar;
