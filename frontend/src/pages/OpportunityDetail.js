import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { Bookmark, ExternalLink, Calendar, Users2, Award, MessageCircle, ArrowLeft, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet, apiPost } from "../lib/api";

function OpportunityDetail() {
  const { user } = useOutletContext();
  const { oppId } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchOpportunityDetail = useCallback(async () => {
    try {
      const data = await apiGet(`/api/opportunities/${oppId}`);
      setOpportunity(data);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
    } finally {
      setLoading(false);
    }
  }, [oppId]);

  useEffect(() => {
    fetchOpportunityDetail();
  }, [fetchOpportunityDetail, oppId]);

  const handleToggleSave = async () => {
    try {
      await apiPost(`/api/opportunities/${oppId}/save`, {});
      fetchOpportunityDetail();
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await apiPost("/api/comments", {
        entity_type: "opportunity",
        entity_id: oppId,
        text: commentText,
      });
      setCommentText("");
      fetchOpportunityDetail();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
      scholarship: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", emoji: "🎓" },
      internship: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", emoji: "💼" },
      workshop: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", emoji: "🛠️" },
      resource: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", emoji: "📚" },
    };
    return configs[type] || configs.internship;
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

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Award size={28} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Opportunity not found</h2>
          <Link to="/opportunities" className="text-amber-600 hover:text-amber-700 font-medium">
            ← Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const isSaved = opportunity.saved_by && opportunity.saved_by.includes(user.user_id);
  const typeConfig = getTypeConfig(opportunity.opp_type);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link to="/opportunities" className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-6 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Opportunities
        </Link>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border} flex items-center gap-1`}>
                <span>{typeConfig.emoji}</span>
                {opportunity.opp_type.toUpperCase()}
              </span>
              {opportunity.verified && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">
                  <Award size={14} />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4" data-testid="opportunity-title">
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users2 size={16} />
              <span>{opportunity.saved_count} saved</span>
            </div>
            {opportunity.deadline && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
              </div>
            )}
            <span>• Posted by {opportunity.user_name}</span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">{opportunity.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {opportunity.organization && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-1">ORGANIZATION</p>
                <p className="text-gray-900 font-medium">{opportunity.organization}</p>
              </div>
            )}
            {opportunity.location && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-1">LOCATION</p>
                <p className="text-gray-900 font-medium flex items-center gap-1">
                  <MapPin size={14} />
                  {opportunity.location}
                </p>
              </div>
            )}
            {opportunity.duration && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-500 mb-1">DURATION</p>
                <p className="text-gray-900 font-medium flex items-center gap-1">
                  <Clock size={14} />
                  {opportunity.duration}
                </p>
              </div>
            )}
          </div>

          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 mb-2">REQUIREMENTS</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleToggleSave}
              className={`h-10 px-5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
                isSaved
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              data-testid="toggle-save-btn"
            >
              <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
              {isSaved ? "Saved" : "Save"}
            </button>
            {opportunity.link && (
              <a
                href={opportunity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-semibold transition-all flex items-center gap-2 text-sm"
              >
                Apply Now
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-amber-500" />
            Community Discussion
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
              placeholder="Share your experience or ask questions..."
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
            {opportunity.comments && opportunity.comments.length > 0 ? (
              opportunity.comments.map((comment) => (
                <div key={comment.comment_id} className="flex gap-3" data-testid={`comment-${comment.comment_id}`}>
                  {comment.user_picture ? (
                    <img src={comment.user_picture} alt={comment.user_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-semibold">
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

export default OpportunityDetail;
