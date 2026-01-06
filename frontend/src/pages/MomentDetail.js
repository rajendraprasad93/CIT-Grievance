import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { apiGet, apiPost } from '../lib/api';
import ReactionButton from '../components/ReactionButton';
import CommentSection from '../components/CommentSection';

function MomentDetail() {
  const { user } = useOutletContext();
  const { momentId } = useParams();
  const [moment, setMoment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({
    helpful: { count: 0, isReacted: false },
    thanks: { count: 0, isReacted: false },
    attending: { count: 0, isReacted: false },
  });

  const fetchMomentDetail = useCallback(async () => {
    try {
      const data = await apiGet(`/api/moments/${momentId}`);
      setMoment(data);
      
      // Initialize reactions (you'll need to add this to backend)
      setReactions({
        helpful: { count: data.reactions?.helpful || 0, isReacted: false },
        thanks: { count: data.reactions?.thanks || 0, isReacted: false },
        attending: { count: data.reactions?.attending || 0, isReacted: false },
      });
    } catch (error) {
      console.error('Error fetching moment:', error);
    } finally {
      setLoading(false);
    }
  }, [momentId]);

  useEffect(() => {
    fetchMomentDetail();
  }, [fetchMomentDetail]);

  const handleReact = async (reactionType) => {
    try {
      await apiPost(`/api/moments/${momentId}/react`, { reaction_type: reactionType });
      
      // Toggle reaction
      setReactions(prev => ({
        ...prev,
        [reactionType]: {
          count: prev[reactionType].isReacted 
            ? prev[reactionType].count - 1 
            : prev[reactionType].count + 1,
          isReacted: !prev[reactionType].isReacted,
        },
      }));
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  const handleSubmitComment = async (text) => {
    try {
      await apiPost('/api/comments', {
        entity_type: 'moment',
        entity_id: momentId,
        text,
      });
      fetchMomentDetail();
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      help: 'bg-blue-50 text-blue-700 border-blue-200',
      campus_life: 'bg-green-50 text-green-700 border-green-200',
      opportunity: 'bg-purple-50 text-purple-700 border-purple-200',
      issue_observation: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[type] || colors.help;
  };

  const getTypeLabel = (type) => {
    const labels = {
      help: 'HELP & STUDY',
      campus_life: 'CAMPUS LIFE',
      opportunity: 'OPPORTUNITY',
      issue_observation: 'ISSUE OBSERVATION',
    };
    return labels[type] || type.toUpperCase();
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

  if (!moment) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={40} className="text-destructive" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4">Moment not found</h2>
          <p className="text-muted-foreground mb-8">
            This moment may have been deleted or the link is incorrect.
          </p>
          <Link 
            to="/community" 
            className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all"
          >
            <ArrowLeft size={20} />
            Back to Community Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/community"
          className="inline-flex items-center gap-2 text-accent hover:underline mb-6"
        >
          <ArrowLeft size={20} />
          Back to Community
        </Link>

        {/* Moment Card */}
        <div className="bg-card rounded-xl border border-border p-8 mb-6">
          {/* Author Info */}
          <div className="flex items-start gap-4 mb-6">
            {moment.user_picture ? (
              <img
                src={moment.user_picture}
                alt={moment.user_name}
                className="w-14 h-14 rounded-full"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-xl">
                {moment.user_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <Link
                to={`/profile/${moment.user_id}`}
                className="font-semibold text-lg hover:text-accent transition-colors"
              >
                {moment.user_name}
              </Link>
              {moment.user_department && (
                <p className="text-sm text-muted-foreground">{moment.user_department}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>{formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-xs font-medium border ${getTypeColor(moment.moment_type)}`}>
              {getTypeLabel(moment.moment_type)}
            </span>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-heading font-bold mb-4">{moment.title}</h1>
          <p className="text-lg text-foreground leading-relaxed mb-6 whitespace-pre-wrap">
            {moment.content}
          </p>

          {/* Image Display */}
          {moment.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-border">
              <img
                src={moment.image_url}
                alt={moment.title || "Moment image"}
                className="w-full object-contain bg-secondary/20"
                style={{ maxHeight: '500px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {moment.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Reactions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <ReactionButton
              type="helpful"
              count={reactions.helpful.count}
              isReacted={reactions.helpful.isReacted}
              onReact={handleReact}
            />
            <ReactionButton
              type="thanks"
              count={reactions.thanks.count}
              isReacted={reactions.thanks.isReacted}
              onReact={handleReact}
            />
            {(moment.moment_type === 'campus_life' || moment.moment_type === 'opportunity') && (
              <ReactionButton
                type="attending"
                count={reactions.attending.count}
                isReacted={reactions.attending.isReacted}
                onReact={handleReact}
              />
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card rounded-xl border border-border p-8">
          <CommentSection
            comments={moment.comments || []}
            onSubmitComment={handleSubmitComment}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
}

export default MomentDetail;
