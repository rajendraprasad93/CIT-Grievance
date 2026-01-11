import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AlertCircle, Upload, Eye, ArrowLeft, Camera, Sparkles } from "lucide-react";
import { apiGet, apiPost } from "../lib/api";
import UniversalImageUpload from "../components/UniversalImageUpload";

function ReportIssue() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hostel",
    location: "",
  });
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const fetchSimilarIssues = useCallback(async () => {
    try {
      const data = await apiGet("/api/issues");
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

  const handleAnalysisComplete = (data) => {
    console.log('AI Analysis complete for issue:', data);
    
    if (data.analysisResult?.auto_fill_data) {
      const autoFill = data.analysisResult.auto_fill_data;
      
      const categoryMap = {
        'drainage': 'infrastructure',
        'garbage': 'infrastructure',
        'electrical': 'infrastructure',
        'plumbing': 'infrastructure',
        'water': 'hostel',
        'food': 'hostel',
        'hostel': 'hostel',
        'safety': 'safety',
        'academic': 'academic',
      };
      
      const mappedCategory = categoryMap[autoFill.category?.toLowerCase()] || 'other';
      
      setFormData(prev => ({
        ...prev,
        title: autoFill.title || prev.title,
        description: autoFill.description || prev.description,
        category: mappedCategory,
        location: autoFill.location || prev.location || "Campus",
      }));
      
      setShowImageUpload(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting issue:', formData);
      const issue = await apiPost("/api/issues", formData);
      
      if (!issue || !issue.issue_id) {
        console.error('Invalid response from server:', issue);
        throw new Error("Server returned invalid response");
      }
      
      console.log('Issue created successfully:', issue);
      navigate(`/issues/${issue.issue_id}`);
    } catch (error) {
      console.error("Error creating issue:", error);
      alert(`Failed to create issue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-amber-50 text-amber-700 border border-amber-200",
      acknowledged: "bg-blue-50 text-blue-700 border border-blue-200",
      in_progress: "bg-orange-50 text-orange-700 border border-orange-200",
      resolved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    };
    return colors[status] || colors.reported;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/issues")}
          className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Issues
        </button>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" data-testid="report-issue-title">
            Report a <span className="text-amber-600">Campus Issue</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Describe what's happening. Others can support, and campus teams can respond.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* AI Image Upload Section */}
            {showImageUpload ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    AI-Powered Issue Detection
                  </h3>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                </div>
                <UniversalImageUpload
                  contextHint="issue"
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Camera size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Have a photo of the issue?</p>
                      <p className="text-xs text-gray-500">Let AI analyze it and auto-fill the form</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Sparkles size={14} />
                    Use AI
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  placeholder="e.g., No hot water in Hostel A"
                  required
                  data-testid="issue-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Details *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[140px] px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                  placeholder="Provide more details about the issue..."
                  required
                  data-testid="issue-description-input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    data-testid="issue-category-select"
                  >
                    <option value="hostel">🏠 Hostel & Mess</option>
                    <option value="infrastructure">🏗️ Infrastructure</option>
                    <option value="safety">🛡️ Safety</option>
                    <option value="academic">📚 Academic & Exam</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    placeholder="e.g., Hostel A - Block B"
                    required
                    data-testid="issue-location-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !formData.title || !formData.description || !formData.location}
                  className="h-11 px-6 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                  data-testid="submit-issue-btn"
                >
                  {loading ? "Submitting..." : "Submit Issue"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/issues")}
                  className="h-11 px-6 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-all text-sm"
                  data-testid="cancel-issue-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            {similarIssues.length > 0 && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5" data-testid="similar-issues">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                  <AlertCircle size={18} className="text-amber-600" />
                  Similar Issues Found
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  These issues might be related. Consider marking "I'm affected" instead of creating a new one.
                </p>
                <div className="space-y-3">
                  {similarIssues.map((issue) => (
                    <div key={issue.issue_id} className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{issue.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(issue.status)}`}>
                          {issue.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{issue.affected_count} affected</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/issues/${issue.issue_id}`)}
                        className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1 font-medium"
                      >
                        <Eye size={12} />
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
