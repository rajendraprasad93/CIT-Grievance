import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Users2, MapPin, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function IssueDetail({ user }) {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchIssueDetail();
  }, [issueId]);

  const fetchIssueDetail = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/issues/${issueId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch issue');
      
      const data = await response.json();
      setIssue(data);
    } catch (error) {
      console.error('Error fetching issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAffected = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/issues/${issueId}/affected`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to toggle affected');
      
      fetchIssueDetail();
    } catch (error) {
      console.error('Error toggling affected:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entity_type: 'issue',
          entity_id: issueId,
          text: commentText
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      setCommentText('');
      fetchIssueDetail();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-slate-100 text-slate-700 border-slate-200',
      acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[status] || colors.reported;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Issue not found</h2>
          <Link to="/issues" className="text-accent hover:underline">← Back to Issues</Link>
        </div>
      </div>
    );
  }

  const isAffected = issue.affected_users && issue.affected_users.includes(user.user_id);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/issues" className="text-accent hover:underline inline-flex items-center gap-1 mb-4">
            ← Back to Issues
          </Link>
        </div>

        <div className="bg-card rounded-xl border border-border p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-heading font-bold" data-testid="issue-title">{issue.title}</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${getStatusColor(issue.status)}`}>
              {issue.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users2 size={16} />
              <span>{issue.affected_count} affected</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <p className="text-foreground mb-6 leading-relaxed">{issue.description}</p>

          <button
            onClick={handleToggleAffected}
            className={`h-10 px-6 rounded-full font-medium transition-all ${
              isAffected
                ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            data-testid="toggle-affected-btn"
          >
            {isAffected ? "✓ I'm Affected" : "I'm Affected"}
          </button>
        </div>

        {issue.timeline && issue.timeline.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-8 mb-6">
            <h2 className="text-2xl font-heading font-semibold mb-6" data-testid="timeline-title">Timeline</h2>
            <div className="space-y-6">
              {issue.timeline.map((entry, index) => (
                <div key={index} className="flex gap-4" data-testid={`timeline-entry-${index}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status).split(' ')[0]}`}></div>
                    {index < issue.timeline.length - 1 && (
                      <div className="w-px h-full bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(entry.status)}`}>
                        {entry.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{entry.user_name}</p>
                    <p className="text-muted-foreground">{entry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-8">
          <h2 className="text-2xl font-heading font-semibold mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Comments
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-input bg-background mb-3"
              placeholder="Add a comment..."
              data-testid="comment-input"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="submit-comment-btn"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div className="space-y-6" data-testid="comments-list">
            {issue.comments && issue.comments.length > 0 ? (
              issue.comments.map((comment) => (
                <div key={comment.comment_id} className="flex gap-4" data-testid={`comment-${comment.comment_id}`}>
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
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;