import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { apiPost } from '../lib/api';

/**
 * PeerReviewModal - Connected to backend
 * Rate and review helpful peers
 */
function PeerReviewModal({ isOpen, onClose, user, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiPost(`/api/users/${user.user_id}/reviews`, {
        rating,
        review_text: review || null,
      });
      
      if (onSubmit) {
        onSubmit({
          userId: user.user_id,
          rating,
          review,
        });
      }
      
      // Reset and close
      setRating(0);
      setReview('');
      onClose();
    } catch (error) {
      console.error('Review error:', error);
      if (error.message.includes('already reviewed')) {
        setError('You have already reviewed this user');
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-heading-2 font-heading font-bold">Rate {user?.name}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.department} • Year {user?.year}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold mb-3">How helpful were they?</label>
            <div className="flex items-center gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={40}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-opportunity text-opportunity'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good' : rating === 2 ? 'Okay' : 'Needs Improvement'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Add a review (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              className="w-full min-h-[100px] px-4 py-3 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {review.length}/200 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex-1 h-12 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold transition-all shadow-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
            <button
              onClick={onClose}
              className="px-6 h-12 rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerReviewModal;
