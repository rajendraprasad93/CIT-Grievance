import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Heart,
  Bookmark,
  Users,
  Briefcase,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { apiGet, apiPost } from "../lib/api";

function CommunityFeed({ user }) {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [filters, setFilters] = useState({
    hostel: "",
    department: "",
    year: "",
  });
  const [showPostModal, setShowPostModal] = useState(false);
  const [newMoment, setNewMoment] = useState({
    moment_type: "help",
    title: "",
    content: "",
    tags: [],
  });

  const fetchMoments = useCallback(async () => {
    try {
      let endpoint = "/api/moments";
      const params = new URLSearchParams();
      
      if (selectedTab !== "all") {
        params.append("moment_type", selectedTab);
      }
      if (filters.hostel) params.append("hostel", filters.hostel);
      if (filters.department) params.append("department", filters.department);
      if (filters.year) params.append("year", filters.year);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const data = await apiGet(endpoint);
      setMoments(data);
    } catch (error) {
      console.error("Error fetching moments:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedTab, filters]);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  const handlePostMoment = async () => {
    try {
      await apiPost("/api/moments", newMoment);

      setShowPostModal(false);
      setNewMoment({ moment_type: "help", title: "", content: "", tags: [] });
      fetchMoments();
    } catch (error) {
      console.error("Error posting moment:", error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      help: "bg-blue-50 text-blue-700 border-blue-200",
      campus_life: "bg-green-50 text-green-700 border-green-200",
      opportunity: "bg-purple-50 text-purple-700 border-purple-200",
      issue_observation: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[type] || colors.help;
  };

  const getTypeLabel = (type) => {
    const labels = {
      help: "HELP & STUDY",
      campus_life: "CAMPUS LIFE",
      opportunity: "OPPORTUNITY",
      issue_observation: "ISSUE OBSERVATION",
    };
    return labels[type] || type.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h1
                className="text-3xl font-heading font-bold"
                data-testid="community-feed-title"
              >
                Campus Community
              </h1>
              <button
                onClick={() => setShowPostModal(true)}
                className="h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all flex items-center gap-2"
                data-testid="post-moment-btn"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Post a Moment</span>
              </button>
            </div>

            <div
              className="flex gap-2 mb-6 overflow-x-auto pb-2"
              data-testid="moment-tabs"
            >
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedTab === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTab("help")}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedTab === "help"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Help & Study
              </button>
              <button
                onClick={() => setSelectedTab("campus_life")}
                className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedTab === "campus_life"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Campus Life
              </button>
            </div>

            {/* Context Filters */}
            <div className="bg-card rounded-xl border border-border p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.hostel}
                  onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                  className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">🏠 All Hostels</option>
                  <option value="A-Block">A-Block</option>
                  <option value="B-Block">B-Block</option>
                  <option value="C-Block">C-Block</option>
                  <option value="D-Block">D-Block</option>
                </select>

                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">📚 All Departments</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="IT">Information Technology</option>
                </select>

                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">🎓 All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>

                {(filters.hostel || filters.department || filters.year) && (
                  <button
                    onClick={() => setFilters({ hostel: "", department: "", year: "" })}
                    className="h-10 px-4 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 font-medium text-sm transition-colors"
                  >
                    ✕ Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4" data-testid="moments-list">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
              ) : moments.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-xl border-2 border-dashed border-border">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">No moments yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Be the first to share something with your campus community!
                  </p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all"
                  >
                    <Plus size={20} />
                    Post Your First Moment
                  </button>
                </div>
              ) : (
                moments.map((moment) => (
                  <Link
                    key={moment.moment_id}
                    to={`/community/${moment.moment_id}`}
                    className="bg-card rounded-xl border-2 border-border p-6 hover:shadow-lg hover:border-accent transition-all block group cursor-pointer"
                    data-testid={`moment-card-${moment.moment_id}`}
                  >
                    <div className="flex items-start gap-4">
                      {moment.user_picture ? (
                        <img
                          src={moment.user_picture}
                          alt={moment.user_name}
                          className="w-12 h-12 rounded-full ring-2 ring-accent/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold ring-2 ring-accent/20">
                          {moment.user_name.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold group-hover:text-accent transition-colors">
                            {moment.user_name}
                          </span>
                          {moment.user_department && (
                            <span className="text-sm text-muted-foreground">
                              • {moment.user_department}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                            moment.moment_type
                          )} mb-3`}
                        >
                          {getTypeLabel(moment.moment_type)}
                        </span>

                        <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                          {moment.title}
                        </h3>
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {moment.content}
                        </p>

                        {moment.tags && moment.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {moment.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart size={16} />
                            <span>{moment.reactions || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={16} />
                            <span>{moment.comments_count || 0} comments</span>
                          </div>
                          <span className="ml-auto text-xs">
                            {formatDistanceToNow(new Date(moment.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="text-accent font-medium group-hover:underline">
                            Read more →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-heading font-semibold mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/report-issue"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <AlertCircle size={20} className="text-accent" />
                    <span>Report an Issue</span>
                  </Link>
                  <Link
                    to="/opportunities"
                    className="flex items-center gap-2 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Briefcase size={20} className="text-accent" />
                    <span>Browse Opportunities</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPostModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPostModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
            data-testid="post-moment-modal"
          >
            <h2 className="text-2xl font-heading font-bold mb-4">
              Post a Moment
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newMoment.moment_type}
                  onChange={(e) =>
                    setNewMoment({ ...newMoment, moment_type: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                  data-testid="moment-type-select"
                >
                  <option value="help">Help & Study</option>
                  <option value="campus_life">Campus Life</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="issue_observation">Issue Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newMoment.title}
                  onChange={(e) =>
                    setNewMoment({ ...newMoment, title: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                  placeholder="Give your moment a title"
                  data-testid="moment-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <textarea
                  value={newMoment.content}
                  onChange={(e) =>
                    setNewMoment({ ...newMoment, content: e.target.value })
                  }
                  className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-input bg-background"
                  placeholder="What's on your mind?"
                  data-testid="moment-content-input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePostMoment}
                  disabled={!newMoment.title || !newMoment.content}
                  className="flex-1 h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="submit-moment-btn"
                >
                  Post
                </button>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 h-10 px-6 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-all"
                  data-testid="cancel-moment-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunityFeed;
