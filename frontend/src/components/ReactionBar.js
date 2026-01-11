import { useState, useEffect } from 'react';
import { MessageCircle, Bookmark, Heart } from 'lucide-react';
import { apiPost, apiGet } from '../lib/api';

function ReactionBar({ moment, onReact, onComment, onSave }) {
  const [reactionsCount, setReactionsCount] = useState(moment.reactions || 0);
  const [userReacted, setUserReacted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReactionStatus = async () => {
      try {
        const data = await apiGet(`/api/moments/${moment.moment_id}/reactions`);
        setUserReacted(data.user_reacted);
        setReactionsCount(data.reactions_count);
      } catch (error) {
        // Silently fail - use default values
      }
    };
    
    if (moment.moment_id) {
      fetchReactionStatus();
    }
  }, [moment.moment_id]);

  const handleReaction = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);
    
    try {
      const data = await apiPost(`/api/moments/${moment.moment_id}/react`);
      setUserReacted(data.reacted);
      setReactionsCount(data.reactions_count);
      
      if (onReact) {
        onReact('helpful', data.reacted);
      }
    } catch (error) {
      console.error('Reaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(!isSaved);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComment) {
      onComment();
    }
  };

  return (
    <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
      {/* Like Button */}
      <button
        onClick={handleReaction}
        disabled={loading}
        className={`flex items-center gap-1.5 text-sm transition-all ${
          userReacted ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'
        } ${loading ? 'opacity-50' : ''}`}
      >
        <Heart size={18} className={userReacted ? 'fill-current' : ''} />
        <span className="font-medium">{reactionsCount > 0 ? reactionsCount : ''}</span>
      </button>

      {/* Comments Button */}
      <button
        onClick={handleComment}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-all"
      >
        <MessageCircle size={18} />
        <span className="font-medium">{moment.comments_count || 0}</span>
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-1.5 text-sm transition-all ml-auto ${
          isSaved ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'
        }`}
      >
        <Bookmark size={18} className={isSaved ? 'fill-current' : ''} />
      </button>

      {/* Read More Arrow */}
      <span className="text-amber-600 font-medium text-sm">→</span>
    </div>
  );
}

export default ReactionBar;
