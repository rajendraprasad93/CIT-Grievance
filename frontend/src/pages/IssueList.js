import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users, Filter, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet } from "../lib/api";

function IssueList() {
  const { user } = useOutletContext();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    inProgress: 0,
    resolved: 0,
  });

  const fetchIssues = useCallback(async () => {
    try {
      let endpoint = "/api/issues";
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const data = await apiGet(endpoint);
      setIssues(data);
      
      setStats({
        total: data.length,
        reported: data.filter(i => i.status === 'reported').length,
        inProgress: data.filter(i => i.status === 'in_progress').length,
        resolved: data.filter(i => i.status === 'resolved').length,
      });
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const getStatusStyle = (status) => {
    const styles = {
      reported: {
        bg: "bg-cit-gold/20",
        text: "text-cit-navy",
        icon: AlertCircle,
        label: "Reported",
      },
      acknowledged: {
        bg: "bg-cit-navy/10",
        text: "text-cit-navy",
        icon: Clock,
        label: "Acknowledged",
      },
      in_progress: {
        bg: "bg-cit-gold/30",
        text: "text-cit-navy",
        icon: TrendingUp,
        label: "In Progress",
      },
      resolved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Resolved",
      },
    };
    return styles[status] || styles.reported;
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[28px] md:text-[32px] font-heading font-bold text-white mb-2" data-testid="issue-list-title">
            Campus Issues & Signals
          </h1>
          <p className="text-white/80 text-[15px]">
            Track and resolve campus issues together. React with "Affected" to escalate issues
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters & Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded border border-gray-200 p-5 shadow-card sticky top-20 space-y-6">
              {/* Stats */}
              <div>
                <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2 text-cit-navy">
                  <TrendingUp size={18} className="text-cit-navy" />
                  Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded bg-cit-light">
                    <span className="text-sm text-gray-600">Total Issues</span>
                    <span className="text-lg font-bold text-cit-navy">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-cit-gold/10">
                    <span className="text-sm text-cit-navy">Reported</span>
                    <span className="text-lg font-bold text-cit-navy">{stats.reported}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-cit-navy/10">
                    <span className="text-sm text-cit-navy">In Progress</span>
                    <span className="text-lg font-bold text-cit-navy">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded bg-green-50">
                    <span className="text-sm text-green-700">Resolved</span>
                    <span className="text-lg font-bold text-green-700">{stats.resolved}</span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={18} className="text-cit-navy" />
                  <h3 className="font-heading font-bold text-base text-cit-navy">Filters</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">CATEGORY</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold"
                      data-testid="category-filter"
                    >
                      <option value="">All Categories</option>
                      <option value="hostel">Hostel & Mess</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="safety">Safety</option>
                      <option value="academic">Academic & Exam</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2">STATUS</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full h-10 px-4 rounded border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold"
                      data-testid="status-filter"
                    >
                      <option value="">All Statuses</option>
                      <option value="reported">Reported</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {(filters.category || filters.status) && (
                    <button
                      onClick={() => setFilters({ category: "", status: "" })}
                      className="w-full h-10 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Report Button */}
              <Link
                to="/report-issue"
                className="w-full h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all shadow-button flex items-center justify-center gap-2"
                data-testid="report-new-issue-btn"
              >
                <Plus size={20} />
                Report Issue
              </Link>
            </div>
          </div>

          {/* Issues List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="section-title">All Issues</h2>
            </div>
            
            <div className="space-y-4" data-testid="issues-list">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
                </div>
              ) : issues.length === 0 ? (
                <div className="text-center py-16 bg-white rounded border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 rounded bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-[20px] font-heading font-semibold text-cit-navy mb-2">
                    No issues found
                  </h3>
                  <p className="text-[15px] text-gray-500">
                    {filters.category || filters.status
                      ? "Try adjusting your filters"
                      : "Great! No issues reported yet"}
                  </p>
                </div>
              ) : (
                issues.map((issue) => {
                  const statusStyle = getStatusStyle(issue.status);
                  const StatusIcon = statusStyle.icon;

                  return (
                    <Link
                      key={issue.issue_id}
                      to={`/issues/${issue.issue_id}`}
                      className="block bg-white rounded border border-gray-200 p-6 hover:shadow-card-hover transition-all group animate-slide-in"
                      data-testid={`issue-card-${issue.issue_id}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Affected Count Badge */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded bg-cit-gold/20 flex flex-col items-center justify-center border border-cit-gold/30">
                            <span className="text-2xl font-bold text-cit-navy">{issue.affected_count || 0}</span>
                            <span className="text-xs text-gray-500">affected</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Status & Category */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                              <StatusIcon size={14} />
                              {statusStyle.label}
                            </span>
                            <span className="px-3 py-1 rounded bg-cit-light text-cit-navy text-xs font-medium">
                              {issue.category}
                            </span>
                            {issue.location && (
                              <span className="px-3 py-1 rounded bg-cit-light text-cit-navy text-xs font-medium">
                                📍 {issue.location}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-heading font-semibold text-cit-navy mb-2 group-hover:text-cit-gold transition-colors">
                            {issue.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {issue.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                            </span>
                            {issue.updated_at !== issue.created_at && (
                              <span className="text-cit-gold font-medium">
                                Updated {formatDistanceToNow(new Date(issue.updated_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
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

export default IssueList;
