import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import {
  Bookmark,
  ExternalLink,
  Calendar,
  Users2,
  Award,
  MessageCircle,
} from "lucide-react";
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

  const getTypeColor = (type) => {
    const colors = {
      scholarship: "bg-purple-50 text-purple-700 border-purple-200",
      internship: "bg-blue-50 text-blue-700 border-blue-200",
      workshop: "bg-green-50 text-green-700 border-green-200",
      resource: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[type] || colors.internship;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">
            Opportunity not found
          </h2>
          <Link to="/opportunities" className="text-accent hover:underline">
            ← Back to Opportunities
          </Link>
        </div>
      </div>
    );
  }

  const isSaved =
    opportunity.saved_by && opportunity.saved_by.includes(user.user_id);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/opportunities"
            className="text-accent hover:underline inline-flex items-center gap-1 mb-4"
          >
            ← Back to Opportunities
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getTypeColor(
                  opportunity.opp_type
                )}`}
              >
                {opportunity.opp_type.toUpperCase()}
              </span>
              {opportunity.verified && (
                <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  <Award size={16} />
                  <span>Verified by Career Cell</span>
                </div>
              )}
            </div>
          </div>

          <h1
            className="text-3xl font-heading font-bold mb-4"
            data-testid="opportunity-title"
          >
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users2 size={16} />
              <span>{opportunity.saved_count} saved</span>
            </div>
            {opportunity.deadline && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Deadline:{" "}
                  {new Date(opportunity.deadline).toLocaleDateString()}
                </span>
              </div>
            )}
            <span>• Posted by {opportunity.user_name}</span>
          </div>

          <p className="text-foreground mb-6 leading-relaxed">
            {opportunity.description}
          </p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Organization:</h3>
            <p className="text-muted-foreground">{opportunity.organization}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Location:</h3>
            <p className="text-muted-foreground">{opportunity.location}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Duration:</h3>
            <p className="text-muted-foreground">{opportunity.duration}</p>
          </div>

          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleToggleSave}
              className={`h-10 px-6 rounded-full font-medium transition-all ${
                isSaved
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              data-testid="toggle-save-btn"
            >
              <Bookmark size={16} className="inline mr-2" />
              {isSaved ? "Saved" : "Save"}
            </button>
            {opportunity.link && (
              <a
                href={opportunity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all flex items-center gap-2"
              >
                Apply Now
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Community Discussion
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-input bg-background mb-3"
              placeholder="Share your experience or ask questions..."
              data-testid="comment-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-comment-btn"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          <div className="space-y-6" data-testid="comments-list">
            {opportunity.comments && opportunity.comments.length > 0 ? (
              opportunity.comments.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="flex gap-4"
                  data-testid={`comment-${comment.comment_id}`}
                >
                  {comment.user_picture ? (
                    <img
                      src={comment.user_picture}
                      alt={comment.user_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                      {comment.user_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpportunityDetail;
