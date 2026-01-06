import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function CommentSection({ comments = [], onSubmitComment, currentUser }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmitComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-heading font-semibold">
        <MessageCircle size={24} />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          {currentUser?.picture ? (
            <img
              src={currentUser.picture}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold flex-shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.comment_id} className="flex gap-3">
              {comment.user_picture ? (
                <img
                  src={comment.user_picture}
                  alt={comment.user_name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold flex-shrink-0">
                  {comment.user_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 bg-secondary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm">{comment.user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
