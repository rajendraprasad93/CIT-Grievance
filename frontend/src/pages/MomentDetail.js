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
      setReactions(prev => ({
        ...prev,
        [reactionType]: {
          count: prev[reactionType].isReacted ? prev[reactionType].count - 1 : prev[reactionType].count + 1,
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

  const getTypeConfig = (type) => {
    const configs = {
      help: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'HELP & STUDY' },
      campus_life: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'CAMPUS LIFE' },
      opportunity: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'OPPORTUNITY' },
      issue_observation: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'ISSUE OBSERVATION' },
    };
    return configs[type] || configs.help;
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

  if (!moment) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Moment not found</h2>
          <p className="text-gray-500 mb-6">This moment may have been deleted or the link is incorrect.</p>
          <Link to="/community" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold transition-all">
            <ArrowLeft size={18} />
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = getTypeConfig(moment.moment_type);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link to="/community" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Community
        </Link>

        {/* Moment Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* Author Info */}
          <div className="flex items-start gap-4 mb-6">
            {moment.user_picture ? (
              <img src={moment.user_picture} alt={moment.user_name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
                {moment.user_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <Link to={`/profile/${moment.user_id}`} className="font-semibold text-gray-900 hover:text-amber-600 transition-colors">
                {moment.user_name}
              </Link>
              {moment.user_department && (
                <p className="text-sm text-gray-500">{moment.user_department}</p>
              )}
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <Calendar size={12} />
                <span>{formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
              {typeConfig.label}
            </span>
          </div>

          {/* Content */}
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{moment.title}</h1>
          <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{moment.content}</p>

          {/* Image Display */}
          {moment.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={moment.image_url}
                alt={moment.title || "Moment image"}
                className="w-full object-contain bg-gray-50"
                style={{ maxHeight: '500px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {moment.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-amber-100 hover:text-amber-700 transition-colors">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Reactions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <ReactionButton type="helpful" count={reactions.helpful.count} isReacted={reactions.helpful.isReacted} onReact={handleReact} />
            <ReactionButton type="thanks" count={reactions.thanks.count} isReacted={reactions.thanks.isReacted} onReact={handleReact} />
            {(moment.moment_type === 'campus_life' || moment.moment_type === 'opportunity') && (
              <ReactionButton type="attending" count={reactions.attending.count} isReacted={reactions.attending.isReacted} onReact={handleReact} />
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <CommentSection comments={moment.comments || []} onSubmitComment={handleSubmitComment} currentUser={user} />
        </div>
      </div>
    </div>
  );
}

export default MomentDetail;
