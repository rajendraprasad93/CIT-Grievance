import { useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';

/**
 * FollowButton Component - Tier 2: Follow System
 */
function FollowButton({ userId, initialFollowing = false, onFollowChange }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      // TODO: API call to follow/unfollow
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API
      
      setIsFollowing(!isFollowing);
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`inline-flex items-center gap-2 h-10 px-6 rounded-xl font-semibold transition-all shadow-button disabled:opacity-50 ${
        isFollowing
          ? 'bg-secondary text-foreground hover:bg-secondary/80 border-2 border-border'
          : 'bg-primary text-white hover:bg-primary/90'
      }`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck size={18} />
          Following
        </>
      ) : (
        <>
          <UserPlus size={18} />
          Follow
        </>
      )}
    </button>
  );
}

export default FollowButton;
