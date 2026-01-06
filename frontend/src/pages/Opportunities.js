import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bookmark, Calendar, Award, TrendingUp, Clock, Users, CheckCircle, Filter } from "lucide-react";
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
      scholarship: { bg: "bg-cit-gold/20", text: "text-cit-navy", emoji: "🎓" },
      internship: { bg: "bg-cit-navy/10", text: "text-cit-navy", emoji: "💼" },
      workshop: { bg: "bg-cit-gold/20", text: "text-cit-navy", emoji: "🛠️" },
      resource: { bg: "bg-cit-light", text: "text-cit-navy", emoji: "📚" },
    };
    return styles[type] || styles.internship;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;
    const daysLeft = differenceInDays(new Date(deadline), new Date());
    
    if (daysLeft < 0) return { text: "Expired", color: "text-gray-500", urgent: false };
    if (daysLeft === 0) return { text: "Today!", color: "text-red-600", urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: "text-red-600", urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft}d left`, color: "text-cit-gold", urgent: false };
    return { text: `${daysLeft}d left`, color: "text-gray-500", urgent: false };
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[28px] md:text-[32px] font-heading font-bold text-white mb-2" data-testid="opportunities-title">
            Opportunities & Resources
          </h1>
          <p className="text-white/80 text-[15px]">
            Discover scholarships, internships, and resources for your academic journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded border border-gray-200 p-5 shadow-card sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={18} className="text-cit-navy" />
                <h3 className="font-heading font-bold text-base text-cit-navy">Filters</h3>
              </div>

              {/* Type Filter */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold text-gray-500 mb-2">TYPE</p>
                <button
                  onClick={() => setFilter("")}
                  className={`w-full px-4 py-2.5 rounded font-semibold transition-all text-sm text-left ${
                    filter === ""
                      ? "bg-cit-navy text-white shadow-button"
                      : "bg-cit-light text-cit-navy hover:bg-gray-200"
                  }`}
                >
                  All Opportunities
                </button>
                <button
                  onClick={() => setFilter("scholarship")}
                  className={`w-full px-4 py-2.5 rounded font-semibold transition-all text-sm text-left ${
                    filter === "scholarship"
                      ? "bg-cit-gold text-cit-navy shadow-button"
                      : "bg-cit-gold/10 text-cit-navy hover:bg-cit-gold/20"
                  }`}
                >
                  🎓 Scholarships
                </button>
                <button
                  onClick={() => setFilter("internship")}
                  className={`w-full px-4 py-2.5 rounded font-semibold transition-all text-sm text-left ${
                    filter === "internship"
                      ? "bg-cit-navy text-white shadow-button"
                      : "bg-cit-navy/10 text-cit-navy hover:bg-cit-navy/20"
                  }`}
                >
                  💼 Internships
                </button>
                <button
                  onClick={() => setFilter("workshop")}
                  className={`w-full px-4 py-2.5 rounded font-semibold transition-all text-sm text-left ${
                    filter === "workshop"
                      ? "bg-cit-gold text-cit-navy shadow-button"
                      : "bg-cit-gold/10 text-cit-navy hover:bg-cit-gold/20"
                  }`}
                >
                  🛠️ Workshops
                </button>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">SORT BY</p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="deadline">Deadline (Urgent First)</option>
                  <option value="popular">Most Saved</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-cit-navy">{opportunities.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Saved</span>
                    <span className="font-bold text-cit-gold">{savedOpps.size}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="section-title">Available Opportunities</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4" data-testid="opportunities-list">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white rounded border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 rounded bg-cit-gold/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={32} className="text-cit-navy" />
                  </div>
                  <h3 className="text-[20px] font-heading font-semibold text-cit-navy mb-2">No opportunities found</h3>
                  <p className="text-[15px] text-gray-500">
                    Check back later for new opportunities!
                  </p>
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
                      className="bg-white rounded border border-gray-200 p-5 hover:shadow-card-hover transition-all group animate-slide-in"
                      data-testid={`opportunity-card-${opp.opp_id}`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${style.bg} ${style.text} flex items-center gap-1`}>
                          <span>{style.emoji}</span>
                          {opp.opp_type.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => handleSave(opp.opp_id, e)}
                          className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                            isSaved
                              ? 'bg-cit-gold/20 text-cit-navy'
                              : 'bg-cit-light text-cit-navy hover:bg-cit-gold/20'
                          }`}
                        >
                          <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                        </button>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-heading font-semibold text-cit-navy mb-2 group-hover:text-cit-gold transition-colors line-clamp-2">
                        {opp.title}
                      </h3>

                      {/* Organization */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-medium text-gray-700">{opp.organization}</span>
                        {opp.verified && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-cit-navy/10 text-cit-navy text-xs font-medium">
                            <CheckCircle size={12} />
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {opp.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
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
