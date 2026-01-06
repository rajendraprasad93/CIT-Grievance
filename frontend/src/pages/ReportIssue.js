import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Upload, Eye } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function ReportIssue({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hostel",
    location: "",
  });
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSimilarIssues = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/issues`, {
        credentials: "include",
      });
      const data = await response.json();
      const filtered = data
        .filter(
          (issue) =>
            issue.title.toLowerCase().includes(formData.title.toLowerCase()) &&
            issue.status !== "resolved"
        )
        .slice(0, 3);
      setSimilarIssues(filtered);
    } catch (error) {
      console.error("Error fetching similar issues:", error);
    }
  }, [formData.title]);

  useEffect(() => {
    if (formData.title.length > 3) {
      fetchSimilarIssues();
    } else {
      setSimilarIssues([]);
    }
  }, [formData.title, fetchSimilarIssues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create issue");

      const issue = await response.json();
      navigate(`/issues/${issue.issue_id}`);
    } catch (error) {
      console.error("Error creating issue:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-heading font-bold mb-2"
            data-testid="report-issue-title"
          >
            Report a Campus Issue
          </h1>
          <p className="text-muted-foreground">
            Describe what's happening. Others can support, and campus teams can
            respond.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl border border-border p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                  placeholder="e.g., No hot water in Hostel A"
                  required
                  data-testid="issue-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Details *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full min-h-[150px] px-3 py-2 rounded-lg border border-input bg-background"
                  placeholder="Provide more details about the issue..."
                  required
                  data-testid="issue-description-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                    data-testid="issue-category-select"
                  >
                    <option value="hostel">Hostel & Mess</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="safety">Safety</option>
                    <option value="academic">Academic & Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background"
                    placeholder="e.g., Hostel A - Block B"
                    required
                    data-testid="issue-location-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.title ||
                    !formData.description ||
                    !formData.location
                  }
                  className="h-12 px-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  data-testid="submit-issue-btn"
                >
                  {loading ? "Submitting..." : "Submit Issue"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/issues")}
                  className="h-12 px-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-all"
                  data-testid="cancel-issue-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            {similarIssues.length > 0 && (
              <div
                className="bg-amber-50 rounded-xl border border-amber-200 p-6"
                data-testid="similar-issues"
              >
                <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-amber-700" />
                  Similar Issues Found
                </h3>
                <p className="text-sm text-amber-800 mb-4">
                  These issues might be related. Consider marking "I'm affected"
                  instead of creating a new one.
                </p>
                <div className="space-y-3">
                  {similarIssues.map((issue) => (
                    <div
                      key={issue.issue_id}
                      className="bg-white rounded-lg p-4 border border-amber-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                            issue.status
                          )}`}
                        >
                          {issue.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {issue.affected_count} affected
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate(`/issues/${issue.issue_id}`)}
                        className="text-accent hover:underline text-sm flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View Issue
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
