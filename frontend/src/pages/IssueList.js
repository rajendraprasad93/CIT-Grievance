import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Users2, Eye, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet } from "../lib/api";

function IssueList({ user }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
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
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-slate-100 text-slate-700 border-slate-200",
      acknowledged: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-amber-50 text-amber-700 border-amber-200",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
    return colors[status] || colors.reported;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-heading font-bold mb-2"
            data-testid="issue-list-title"
          >
            Campus Issues & Signals
          </h1>
          <p className="text-muted-foreground">
            These are issues raised by students. Add "I'm affected" if it
            impacts you too.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="h-10 px-4 rounded-full border border-input bg-background"
            data-testid="category-filter"
          >
            <option value="">All Categories</option>
            <option value="hostel">Hostel & Mess</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="safety">Safety</option>
            <option value="academic">Academic & Exam</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="h-10 px-4 rounded-full border border-input bg-background"
            data-testid="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <Link
            to="/report-issue"
            className="h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            data-testid="report-new-issue-btn"
          >
            Report New Issue
          </Link>
        </div>

        <div className="grid gap-4" data-testid="issues-list">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">
                No issues found with current filters.
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <Link
                key={issue.issue_id}
                to={`/issues/${issue.issue_id}`}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md hover:border-accent/50 transition-all group"
                data-testid={`issue-card-${issue.issue_id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-semibold">
                          {issue.affected_count}
                        </div>
                        <span className="text-muted-foreground">affected</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {issue.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-accent transition-colors">
                      {issue.title}
                    </h3>

                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {issue.category}
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                        {issue.location}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <p>
                      Reported{" "}
                      {formatDistanceToNow(new Date(issue.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {issue.updated_at !== issue.created_at && (
                      <p className="text-xs">
                        Updated{" "}
                        {formatDistanceToNow(new Date(issue.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueList;
