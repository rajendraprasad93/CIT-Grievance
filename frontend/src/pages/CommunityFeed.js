import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import PostMomentModal from "../components/PostMomentModal";
import { 
  Sparkles, RefreshCw, Plus, TrendingUp, Users, Zap, 
  MessageCircle, Heart, Bookmark, Share2, MoreHorizontal,
  Flame, Calendar, Activity, Radio, Eye, Coffee, ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

function CommunityFeed() {
  const { user } = useOutletContext();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);

  const fetchMoments = useCallback(async () => {
    try {
      let endpoint = "/api/moments";
      if (selectedTab !== "all") {
        endpoint += `?moment_type=${selectedTab}`;
      }
      const data = await apiGet(endpoint);
      setMoments(data);
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  const handlePostMoment = async (momentData) => {
    try {
      if (momentData.image) {
        const formData = new FormData();
        formData.append('moment_type', momentData.moment_type);
        formData.append('title', momentData.title);
        formData.append('content', momentData.content);
        formData.append('tags', momentData.tags.join(','));
        formData.append('image', momentData.image);
        
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/moments/with-image`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
      } else {
        await apiPost("/api/moments", momentData);
      }
      setShowPostModal(false);
      fetchMoments();
    } catch (error) {
      console.error("Error posting moment:", error);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const liveStats = { online: 47, trending: 12, newPosts: 8 };

  const quickActions = [
    { icon: '📚', label: 'Study Help', desc: 'Ask questions' },
    { icon: '🎉', label: 'Campus Life', desc: 'Share moments' },
    { icon: '💼', label: 'Opportunities', desc: 'Jobs & internships' },
    { icon: '⚠️', label: 'Report Issue', desc: 'Campus problems' },
  ];

  const trendingTopics = [
    { tag: 'DBMS Exam', count: 234, hot: true },
    { tag: 'Hackathon 2026', count: 189 },
    { tag: 'Hostel WiFi', count: 156, hot: true },
    { tag: 'Placement Prep', count: 142 },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{greeting} 👋</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, <span className="text-amber-600">{firstName}</span>
              </h1>
            </div>
            
            {/* Live Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-emerald-700">{liveStats.online} online</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.online}</p>
                  <p className="text-sm text-gray-500">Online Now</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flame size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.trending}</p>
                  <p className="text-sm text-gray-500">Trending</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{liveStats.newPosts}</p>
                  <p className="text-sm text-gray-500">New Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Feed */}
          <div className="col-span-12 lg:col-span-8 space-y-5">
            
            {/* Create Post */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-11 h-11 rounded-full object-cover" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                    {firstName.charAt(0)}
                  </div>
                )}
                <button
                  onClick={() => setShowPostModal(true)}
                  className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors text-sm"
                >
                  What's happening on campus, {firstName}?
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => setShowPostModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 text-sm"
                    >
                      <span>{action.icon}</span>
                      <span className="hidden sm:inline font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowPostModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All', icon: '🔥' },
                { id: 'help', label: 'Study', icon: '📚' },
                { id: 'campus_life', label: 'Life', icon: '🎉' },
                { id: 'opportunity', label: 'Jobs', icon: '💼' },
                { id: 'issue_observation', label: 'Issues', icon: '⚠️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedTab === tab.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              
              <button
                onClick={() => fetchMoments()}
                className="ml-auto p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <RefreshCw size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Feed */}
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                ))
              ) : moments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Coffee size={28} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-500 mb-6 text-sm">Be the first to share something! 🎉</p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                moments.map((moment) => (
                  <FeedCard key={moment.moment_id} moment={moment} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => setShowPostModal(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left group"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-amber-600 transition-colors">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-500" />
                Trending Now
              </h3>
              <div className="space-y-1">
                {trendingTopics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm font-mono w-5">#{idx + 1}</span>
                      <span className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors text-sm">
                        {topic.tag}
                      </span>
                      {topic.hot && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">
                          Hot
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classmates Online */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" />
                Classmates Online
              </h3>
              <div className="flex -space-x-2 mb-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-500 text-xs font-medium">
                  +41
                </div>
              </div>
              <p className="text-sm text-gray-500">
                <span className="text-emerald-600 font-semibold">47 students</span> from {user?.department || 'CSE'} are online
              </p>
            </div>

            {/* Events */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-amber-400" />
                Upcoming Events
              </h3>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="font-semibold text-sm">🎯 Hackathon 2026</p>
                  <p className="text-white/70 text-xs mt-1">Tomorrow, 9:00 AM</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="font-semibold text-sm">📚 DBMS Workshop</p>
                  <p className="text-white/70 text-xs mt-1">Friday, 2:00 PM</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-semibold transition-colors text-gray-900">
                View All Events
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 hover:shadow-xl hover:scale-105 transition-all z-50 group"
      >
        <Plus size={24} className="text-white group-hover:rotate-90 transition-transform" />
      </button>

      <PostMomentModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostMoment}
        user={user}
      />
    </div>
  );
}

// Feed Card Component
function FeedCard({ moment }) {
  const getCategoryConfig = (type) => {
    const configs = {
      help: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '📚', label: 'Study' },
      campus_life: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🎉', label: 'Life' },
      opportunity: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '💼', label: 'Job' },
      issue_observation: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '⚠️', label: 'Issue' },
    };
    return configs[type] || configs.help;
  };

  const config = getCategoryConfig(moment.moment_type);

  return (
    <Link to={`/community/${moment.moment_id}`}>
      <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-sm transition-all group">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {moment.user_picture ? (
                  <img
                    src={moment.user_picture}
                    alt={moment.user_name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                    {moment.user_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {moment.user_name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
                    {config.icon} {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>{moment.user_department}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            
            <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            {moment.title && (
              <h3 className="text-base font-semibold text-gray-900 mb-1.5 group-hover:text-amber-600 transition-colors">
                {moment.title}
              </h3>
            )}
            <p className="text-gray-600 text-sm line-clamp-3">{moment.content}</p>
          </div>

          {/* Image */}
          {moment.image_url && (
            <div className="mb-4 -mx-5">
              <img src={moment.image_url} alt="" className="w-full object-cover max-h-72" />
            </div>
          )}

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {moment.tags.slice(0, 4).map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-amber-100 hover:text-amber-700 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-rose-500 transition-colors">
                <Heart size={18} />
                <span className="text-sm font-medium">{moment.reactions || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">{moment.comments_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                <Eye size={18} />
                <span className="text-sm font-medium">{moment.views || 0}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                <Bookmark size={18} />
              </button>
              <button className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default CommunityFeed;
