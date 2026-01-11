import { useState, useEffect, useCallback } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users, Filter, Plus, AlertTriangle, Activity } from "lucide-react";
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
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: AlertCircle,
        label: "Reported",
      },
      acknowledged: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Clock,
        label: "Acknowledged",
      },
      in_progress: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: TrendingUp,
        label: "In Progress",
      },
      resolved: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: CheckCircle,
        label: "Resolved",
      },
    };
    return styles[status] || styles.reported;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Track & Resolve ⚠️</p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900" data-testid="issue-list-title">
                Campus <span className="text-amber-600">Issues</span> & Signals
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Track and resolve campus issues together. React with "Affected" to escalate
              </p>
            </div>
            
            <Link
              to="/report-issue"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
              data-testid="report-new-issue-btn"
            >
              <Plus size={18} />
              Report Issue
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.reported}</p>
                  <p className="text-sm text-gray-500">Reported</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                  <p className="text-sm text-gray-500">Resolved</p>
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

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">CATEGORY</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    data-testid="category-filter"
                  >
                    <option value="">All Categories</option>
                    <option value="hostel">🏠 Hostel & Mess</option>
                    <option value="infrastructure">🏗️ Infrastructure</option>
                    <option value="safety">🛡️ Safety</option>
                    <option value="academic">📚 Academic & Exam</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">STATUS</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    className="w-full h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium text-sm transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="lg:col-span-3">
            <div className="space-y-4" data-testid="issues-list">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-24 mb-3" />
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : issues.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No issues found</h3>
                  <p className="text-gray-500 text-sm">
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
                      className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
                      data-testid={`issue-card-${issue.issue_id}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Affected Count Badge */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-xl bg-amber-50 flex flex-col items-center justify-center border border-amber-200">
                            <span className="text-2xl font-bold text-amber-600">{issue.affected_count || 0}</span>
                            <span className="text-xs text-gray-500">affected</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Status & Category */}
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                              <StatusIcon size={14} />
                              {statusStyle.label}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                              {issue.category}
                            </span>
                            {issue.location && (
                              <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium">
                                📍 {issue.location}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                            {issue.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                            {issue.description}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>
                              Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                            </span>
                            {issue.updated_at !== issue.created_at && (
                              <span className="text-amber-600 font-medium">
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
