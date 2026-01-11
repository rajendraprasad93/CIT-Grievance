import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { Users2, MapPin, Calendar, MessageCircle, ArrowLeft, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet, apiPost } from "../lib/api";

function IssueDetail() {
  const { user } = useOutletContext();
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchIssueDetail = useCallback(async () => {
    try {
      const data = await apiGet(`/api/issues/${issueId}`);
      setIssue(data);
    } catch (error) {
      console.error("Error fetching issue:", error);
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssueDetail();
  }, [fetchIssueDetail, issueId]);

  const handleToggleAffected = async () => {
    try {
      await apiPost(`/api/issues/${issueId}/affected`, {});
      fetchIssueDetail();
    } catch (error) {
      console.error("Error toggling affected:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await apiPost("/api/comments", {
        entity_type: "issue",
        entity_id: issueId,
        text: commentText,
      });
      setCommentText("");
      fetchIssueDetail();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      reported: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle },
      acknowledged: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock },
      in_progress: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: TrendingUp },
      resolved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle },
    };
    return styles[status] || styles.reported;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue not found</h2>
          <Link to="/issues" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const isAffected = issue.affected_users && issue.affected_users.includes(user.user_id);
  const statusStyle = getStatusStyle(issue.status);
  const StatusIcon = statusStyle.icon;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link to="/issues" className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-6 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Issues
        </Link>

        {/* Main Issue Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900" data-testid="issue-title">
              {issue.title}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border} whitespace-nowrap`}>
              <StatusIcon size={14} />
              {issue.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users2 size={14} className="text-amber-600" />
              </div>
              <span>{issue.affected_count} affected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin size={14} className="text-blue-600" />
              </div>
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Calendar size={14} className="text-gray-600" />
              </div>
              <span>Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{issue.description}</p>

          <button
            onClick={handleToggleAffected}
            className={`h-10 px-5 rounded-lg font-semibold transition-all text-sm ${
              isAffected
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            data-testid="toggle-affected-btn"
          >
            {isAffected ? "✓ I'm Affected" : "I'm Affected"}
          </button>
        </div>

        {/* Timeline */}
        {issue.timeline && issue.timeline.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6" data-testid="timeline-title">Timeline</h2>
            <div className="space-y-6">
              {issue.timeline.map((entry, index) => {
                const entryStyle = getStatusStyle(entry.status);
                return (
                  <div key={index} className="flex gap-4" data-testid={`timeline-entry-${index}`}>
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      {index < issue.timeline.length - 1 && (
                        <div className="w-px h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${entryStyle.bg} ${entryStyle.text} border ${entryStyle.border}`}>
                          {entry.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{entry.user_name}</p>
                      <p className="text-sm text-gray-500">{entry.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-amber-500" />
            Comments
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
              placeholder="Add a comment..."
              data-testid="comment-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="h-10 px-5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              data-testid="submit-comment-btn"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-5" data-testid="comments-list">
            {issue.comments && issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div key={comment.comment_id} className="flex gap-3" data-testid={`comment-${comment.comment_id}`}>
                  {comment.user_picture ? (
                    <img src={comment.user_picture} alt={comment.user_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-semibold text-sm">
                      {comment.user_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{comment.user_name}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;
