import { useState, useEffect } from 'react';
import { Activity, Users, MessageCircle, TrendingUp, Zap, Bell } from 'lucide-react';

function LiveActivityHero({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseActive, setPulseActive] = useState(true);
  
  // Simulated live stats (in real app, these would come from backend)
  const [liveStats, setLiveStats] = useState({
    activeStudents: 23,
    newAnnouncements: 3,
    trendingDiscussions: 7,
    newOpportunities: 2
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Pulse animation toggle
    const pulseTimer = setInterval(() => setPulseActive(p => !p), 2000);
    return () => clearInterval(pulseTimer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cit-navy via-cit-navy-light to-cit-navy-dark">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cit-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-electric-blue/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cit-gold/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Main Greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-white">
              {getGreeting()}, <span className="text-cit-gold">{firstName}</span> 👋
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-xl">
              What's happening around campus right now?
            </p>
          </div>

          {/* Live Pulse Indicator */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full bg-pulse-green ${pulseActive ? 'animate-ping' : ''}`} />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-pulse-green" />
            </div>
            <span className="text-white font-medium text-sm">Campus is alive</span>
          </div>
        </div>

        {/* Live Activity Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Active Students */}
          <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 hover:border-cit-gold/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={20} className="text-pulse-green" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{liveStats.activeStudents}</div>
                <div className="text-xs text-white/60">students online</div>
              </div>
            </div>
          </div>

          {/* New Announcements */}
          <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 hover:border-cit-gold/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cit-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell size={20} className="text-cit-gold" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{liveStats.newAnnouncements}</div>
                <div className="text-xs text-white/60">new announcements</div>
              </div>
            </div>
          </div>

          {/* Trending Discussions */}
          <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 hover:border-cit-gold/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-electric-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={20} className="text-electric-blue" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{liveStats.trendingDiscussions}</div>
                <div className="text-xs text-white/60">trending now</div>
              </div>
            </div>
          </div>

          {/* New Opportunities */}
          <div className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 hover:border-cit-gold/30 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-hot-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-hot-pink" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{liveStats.newOpportunities}</div>
                <div className="text-xs text-white/60">opportunities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveActivityHero;
