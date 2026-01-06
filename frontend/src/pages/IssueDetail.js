import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import {
  Users2,
  MapPin,
  Calendar,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
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

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-cit-gold/20 text-cit-navy",
      acknowledged: "bg-cit-navy/10 text-cit-navy",
      in_progress: "bg-cit-gold/30 text-cit-navy",
      resolved: "bg-green-100 text-green-700",
    };
    return colors[status] || colors.reported;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-heading font-bold text-cit-navy mb-4">
            Issue not found
          </h2>
          <Link to="/issues" className="text-cit-gold hover:underline">
            ← Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  const isAffected =
    issue.affected_users && issue.affected_users.includes(user.user_id);

  return (
    <div className="min-h-screen bg-cit-light pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-cit-navy text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/issues"
            className="text-white/80 hover:text-white inline-flex items-center gap-1 mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Issues
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded border border-gray-200 p-8 mb-6 shadow-card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1
              className="text-2xl md:text-3xl font-heading font-bold text-cit-navy"
              data-testid="issue-title"
            >
              {issue.title}
            </h1>
            <span
              className={`px-4 py-2 rounded text-sm font-semibold whitespace-nowrap ${getStatusColor(
                issue.status
              )}`}
            >
              {issue.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users2 size={16} className="text-cit-navy" />
              <span>{issue.affected_count} affected</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-cit-navy" />
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-cit-navy" />
              <span>
                Reported{" "}
                {formatDistanceToNow(new Date(issue.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {issue.description}
          </p>

          <button
            onClick={handleToggleAffected}
            className={`h-10 px-6 rounded font-semibold transition-all ${
              isAffected
                ? "bg-cit-gold text-cit-navy hover:bg-[#e5a617]"
                : "bg-cit-light text-cit-navy hover:bg-gray-200"
            }`}
            data-testid="toggle-affected-btn"
          >
            {isAffected ? "✓ I'm Affected" : "I'm Affected"}
          </button>
        </div>

        {issue.timeline && issue.timeline.length > 0 && (
          <div className="bg-white rounded border border-gray-200 p-8 mb-6 shadow-card">
            <h2
              className="text-xl font-heading font-semibold text-cit-navy mb-6"
              data-testid="timeline-title"
            >
              Timeline
            </h2>
            <div className="space-y-6">
              {issue.timeline.map((entry, index) => (
                <div
                  key={index}
                  className="flex gap-4"
                  data-testid={`timeline-entry-${index}`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-cit-gold"></div>
                    {index < issue.timeline.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(
                          entry.status
                        )}`}
                      >
                        {entry.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-cit-navy mb-1">
                      {entry.user_name}
                    </p>
                    <p className="text-gray-600">{entry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded border border-gray-200 p-8 shadow-card">
          <h2 className="text-xl font-heading font-semibold text-cit-navy mb-6 flex items-center gap-2">
            <MessageCircle size={24} className="text-cit-navy" />
            Comments
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded border border-gray-300 bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
              placeholder="Add a comment..."
              data-testid="comment-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="h-10 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-comment-btn"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-6" data-testid="comments-list">
            {issue.comments && issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="flex gap-4"
                  data-testid={`comment-${comment.comment_id}`}
                >
                  {comment.user_picture ? (
                    <img
                      src={comment.user_picture}
                      alt={comment.user_name}
                      className="w-10 h-10 rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-cit-navy text-white flex items-center justify-center font-semibold">
                      {comment.user_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-cit-navy">{comment.user_name}</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;
