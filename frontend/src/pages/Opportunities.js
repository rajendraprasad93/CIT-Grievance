import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bookmark, Calendar, Award, TrendingUp, Clock, Users, CheckCircle, Filter, Briefcase, ArrowRight } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { apiGet } from "../lib/api";

function Opportunities() {
  const { user } = useOutletContext();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [savedOpps, setSavedOpps] = useState(new Set());

  const fetchOpportunities = useCallback(async () => {
    try {
      let endpoint = "/api/opportunities";
      const params = new URLSearchParams();
      if (filter) params.append("opp_type", filter);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const data = await apiGet(endpoint);
      
      let sorted = [...data];
      if (sortBy === "deadline") {
        sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      } else if (sortBy === "popular") {
        sorted.sort((a, b) => (b.saved_count || 0) - (a.saved_count || 0));
      } else if (sortBy === "recent") {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      setOpportunities(sorted);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleSave = (oppId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSavedOpps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(oppId)) {
        newSet.delete(oppId);
      } else {
        newSet.add(oppId);
      }
      return newSet;
    });
  };

  const getTypeStyle = (type) => {
    const styles = {
      scholarship: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", emoji: "🎓" },
      internship: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", emoji: "💼" },
      workshop: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", emoji: "🛠️" },
      resource: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", emoji: "📚" },
    };
    return styles[type] || styles.internship;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const daysLeft = differenceInDays(new Date(deadline), new Date());
    
    if (daysLeft < 0) return { text: "Expired", color: "text-gray-400", urgent: false };
    if (daysLeft === 0) return { text: "Today!", color: "text-red-600", urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: "text-red-600", urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, color: "text-amber-600", urgent: false };
    return { text: `${daysLeft}d left`, color: "text-gray-500", urgent: false };
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Discover 💼</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="opportunities-title">
                Opportunities & <span className="text-amber-600">Resources</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Scholarships, internships, and resources for your academic journey
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Briefcase size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {opportunities.filter(o => {
                      const days = differenceInDays(new Date(o.deadline), new Date());
                      return days >= 0 && days <= 7;
                    }).length}
                  </p>
                  <p className="text-sm text-gray-500">Closing Soon</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bookmark size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{savedOpps.size}</p>
                  <p className="text-sm text-gray-500">Saved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-amber-500" />
                <h3 className="font-bold text-gray-900">Filters</h3>
              </div>

              {/* Type Filter */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-gray-500 mb-2">TYPE</p>
                {[
                  { id: '', label: 'All Opportunities', emoji: '🔥' },
                  { id: 'scholarship', label: 'Scholarships', emoji: '🎓' },
                  { id: 'internship', label: 'Internships', emoji: '💼' },
                  { id: 'workshop', label: 'Workshops', emoji: '🛠️' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFilter(type.id)}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all text-sm text-left flex items-center gap-2 ${
                      filter === type.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{type.emoji}</span>
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">SORT BY</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="deadline">Deadline (Urgent First)</option>
                  <option value="popular">Most Saved</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-4" data-testid="opportunities-list">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-16 h-6 bg-gray-200 rounded" />
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </div>
                ))
              ) : opportunities.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={28} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No opportunities found</h3>
                  <p className="text-gray-500 text-sm">Check back later for new opportunities!</p>
                </div>
              ) : (
                opportunities.map((opp) => {
                  const style = getTypeStyle(opp.opp_type);
                  const deadlineStatus = getDeadlineStatus(opp.deadline);
                  const isSaved = savedOpps.has(opp.opp_id);

                  return (
                    <Link
                      key={opp.opp_id}
                      to={`/opportunities/${opp.opp_id}`}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
                      data-testid={`opportunity-card-${opp.opp_id}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text} border ${style.border} flex items-center gap-1`}>
                          <span>{style.emoji}</span>
                          {opp.opp_type.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => handleSave(opp.opp_id, e)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isSaved
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                        >
                          <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {opp.title}
                      </h3>

                      {/* Organization & Location */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        {opp.organization && (
                          <span className="text-sm font-medium text-gray-600">{opp.organization}</span>
                        )}
                        {opp.location && (
                          <span className="text-xs text-gray-500">📍 {opp.location}</span>
                        )}
                        {opp.verified && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium">
                            <CheckCircle size={12} />
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Stipend if available */}
                      {opp.stipend && (
                        <div className="text-xs text-emerald-600 font-medium mb-2">
                          💰 {opp.stipend}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {opp.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Users size={14} />
                          <span className="font-medium">{opp.saved_count || 0} saved</span>
                        </div>
                        {deadlineStatus && (
                          <div className={`flex items-center gap-1 text-sm font-semibold ${deadlineStatus.color}`}>
                            <Clock size={14} />
                            <span>{deadlineStatus.text}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Opportunities;
