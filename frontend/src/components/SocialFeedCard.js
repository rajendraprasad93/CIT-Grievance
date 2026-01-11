import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, Heart, Bookmark, Share2, 
  MoreHorizontal, MapPin, Users, CheckCircle,
  AlertTriangle, Sparkles, BookOpen, Briefcase
} from 'lucide-react';
import ReactionBar from './ReactionBar';

function SocialFeedCard({ moment }) {
  const getCategoryConfig = (type) => {
    const configs = {
      help: {
        gradient: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: BookOpen,
        label: 'Help & Study',
        emoji: '📚',
      },
      campus_life: {
        gradient: 'from-cit-gold to-amber-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: Sparkles,
        label: 'Campus Life',
        emoji: '🎓',
      },
      opportunity: {
        gradient: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        icon: Briefcase,
        label: 'Opportunity',
        emoji: '💼',
      },
      issue_observation: {
        gradient: 'from-rose-500 to-pink-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        icon: AlertTriangle,
        label: 'Issue',
        emoji: '⚠️',
      },
    };
    return configs[type] || configs.help;
  };

  const config = getCategoryConfig(moment.moment_type);
  const IconComponent = config.icon;

  return (
    <Link to={`/community/${moment.moment_id}`} className="block group">
      <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card-hover hover:border-cit-gold/30 transition-all duration-300 animate-slide-in">
        {/* Category Accent Bar */}
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
        
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            {/* Avatar with Online Indicator */}
            <div className="relative flex-shrink-0">
              {moment.user_picture ? (
                <img
                  src={moment.user_picture}
                  alt={moment.user_name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-cit-gold/30 transition-all"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cit-navy to-cit-navy-light text-white flex items-center justify-center font-bold text-lg ring-2 ring-gray-100 group-hover:ring-cit-gold/30 transition-all">
                  {moment.user_name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-pulse-green rounded-full border-2 border-white" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-cit-navy group-hover:text-cit-gold transition-colors">
                  {moment.user_name}
                </span>
                {moment.user_verified && (
                  <CheckCircle size={14} className="text-electric-blue fill-electric-blue/20" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                {moment.user_department && (
                  <span className="font-medium">{moment.user_department}</span>
                )}
                {moment.user_year && (
                  <>
                    <span>•</span>
                    <span>Year {moment.user_year}</span>
                  </>
                )}
                {moment.user_hostel && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {moment.user_hostel}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} ${config.border} border`}>
              <span className="text-sm">{config.emoji}</span>
              <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            {moment.title && (
              <h3 className="text-lg font-semibold text-cit-navy mb-2 group-hover:text-cit-gold transition-colors line-clamp-2">
                {moment.title}
              </h3>
            )}
            <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-3">
              {moment.content}
            </p>
          </div>

          {/* Image */}
          {moment.image_url && (
            <div className="mb-4 -mx-5">
              <img
                src={moment.image_url}
                alt={moment.title || 'Post image'}
                className="w-full object-cover bg-gray-50"
                style={{ maxHeight: '400px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {moment.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-cit-light text-cit-navy rounded-full text-xs font-medium hover:bg-cit-gold/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {moment.tags.length > 4 && (
                <span className="px-2.5 py-1 text-gray-400 text-xs">
                  +{moment.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-400 mb-4">
            {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
          </div>

          {/* Reaction Bar */}
          <div className="pt-3 border-t border-gray-100">
            <ReactionBar
              moment={moment}
              onReact={(type, isActive) => console.log('Reaction:', type, isActive)}
              onComment={() => {}}
              onSave={(isSaved) => console.log('Save:', isSaved)}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}

export default SocialFeedCard;
