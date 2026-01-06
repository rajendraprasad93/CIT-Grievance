import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import MomentCard from "../components/MomentCard";
import TrendingSection from "../components/TrendingSection";
import PostMomentModal from "../components/PostMomentModal";

function CommunityFeed() {
  const { user } = useOutletContext();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [filters, setFilters] = useState({
    hostel: "",
    department: "",
    year: "",
  });
  const [showPostModal, setShowPostModal] = useState(false);

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

  const handlePostMoment = async (momentData) => {
    try {
      if (momentData.image) {
        const formData = new FormData();
        formData.append('moment_type', momentData.moment_type);
        formData.append('title', momentData.title);
        formData.append('content', momentData.content);
        formData.append('tags', momentData.tags.join(','));
        formData.append('image', momentData.image);
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/moments/with-image`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to post moment with image');
        }
      } else {
        await apiPost("/api/moments", momentData);
      }
      
      setShowPostModal(false);
      fetchMoments();
    } catch (error) {
      console.error("Error posting moment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[28px] md:text-[32px] font-heading font-bold text-white mb-2">
            Campus Community
          </h1>
          <p className="text-white/80 text-[15px]">
            Connect, share, and stay updated with what's happening at CIT Chennai
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Section Title */}
            <div className="mb-6">
              <h2 className="section-title">Campus Moments</h2>
            </div>

            {/* Category Tabs - CIT Style */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide" data-testid="moment-tabs">
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-5 py-2.5 rounded font-semibold transition-all whitespace-nowrap text-sm ${
                  selectedTab === "all"
                    ? "bg-cit-navy text-white shadow-button"
                    : "bg-white text-cit-navy hover:bg-cit-light border border-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTab("help")}
                className={`px-5 py-2.5 rounded font-semibold transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  selectedTab === "help"
                    ? "bg-cit-navy text-white shadow-button"
                    : "bg-white text-cit-navy hover:bg-cit-light border border-gray-200"
                }`}
              >
                <span>📚</span> Help & Study
              </button>
              <button
                onClick={() => setSelectedTab("campus_life")}
                className={`px-5 py-2.5 rounded font-semibold transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  selectedTab === "campus_life"
                    ? "bg-cit-gold text-cit-navy shadow-button"
                    : "bg-white text-cit-navy hover:bg-cit-light border border-gray-200"
                }`}
              >
                <span>🎓</span> Campus Life
              </button>
              <button
                onClick={() => setSelectedTab("opportunity")}
                className={`px-5 py-2.5 rounded font-semibold transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  selectedTab === "opportunity"
                    ? "bg-cit-navy text-white shadow-button"
                    : "bg-white text-cit-navy hover:bg-cit-light border border-gray-200"
                }`}
              >
                <span>💼</span> Opportunities
              </button>
              <button
                onClick={() => setSelectedTab("issue_observation")}
                className={`px-5 py-2.5 rounded font-semibold transition-all whitespace-nowrap text-sm flex items-center gap-1.5 ${
                  selectedTab === "issue_observation"
                    ? "bg-cit-gold text-cit-navy shadow-button"
                    : "bg-white text-cit-navy hover:bg-cit-light border border-gray-200"
                }`}
              >
                <span>⚠️</span> Issues
              </button>
            </div>

            {/* Context Filters */}
            <div className="bg-cit-light rounded border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.hostel}
                  onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                  className="h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all"
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
                  className="h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all"
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
                  className="h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all"
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
                    className="h-10 px-4 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors"
                  >
                    ✕ Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Moments List */}
            <div className="space-y-4" data-testid="moments-list">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
                </div>
              ) : moments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 rounded bg-cit-gold/20 flex items-center justify-center mx-auto mb-4">
                    <Plus size={32} className="text-cit-navy" />
                  </div>
                  <h3 className="text-[20px] font-heading font-semibold text-cit-navy mb-2">No moments yet</h3>
                  <p className="text-[15px] text-gray-500 mb-6">
                    Be the first to share something with your campus community!
                  </p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="inline-flex items-center gap-2 h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all shadow-button"
                  >
                    <Plus size={20} />
                    Post Your First Moment
                  </button>
                </div>
              ) : (
                moments.map((moment) => (
                  <MomentCard key={moment.moment_id} moment={moment} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar - Trending Section */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <TrendingSection userContext={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button - CIT Style */}
      <button
        onClick={() => setShowPostModal(true)}
        className="fixed bottom-24 md:bottom-8 right-8 w-14 h-14 rounded bg-cit-navy text-white shadow-card-hover hover:bg-[#003875] transition-all flex items-center justify-center z-40"
        aria-label="Post Moment"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Post Moment Modal */}
      <PostMomentModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={handlePostMoment}
        user={user}
      />
    </div>
  );
}

export default CommunityFeed;
