import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import ReactionBar from "./ReactionBar";

function MomentCard({ moment }) {
  const getCategoryStyle = (type) => {
    const styles = {
      help: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Help & Study", emoji: "📚" },
      campus_life: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Campus Life", emoji: "🎓" },
      opportunity: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Opportunity", emoji: "💼" },
      issue_observation: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Issue", emoji: "⚠️" },
    };
    return styles[type] || styles.help;
  };

  const style = getCategoryStyle(moment.moment_type);

  return (
    <Link to={`/community/${moment.moment_id}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group cursor-pointer">
        {/* Header with Avatar and User Info */}
        <div className="flex items-start gap-3 mb-3">
          {moment.user_picture ? (
            <img src={moment.user_picture} alt={moment.user_name} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-lg">
              {moment.user_name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                {moment.user_name}
              </span>
              {moment.user_department && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{moment.user_department}</span>
                </>
              )}
              {moment.user_year && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">Year {moment.user_year}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Category Badge */}
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${style.bg} ${style.text} border ${style.border} flex items-center gap-1 whitespace-nowrap`}>
            <span>{style.emoji}</span>
            <span>{style.label}</span>
          </span>
        </div>

        {/* Content */}
        <div className="mb-3">
          {moment.title && (
            <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
              {moment.title}
            </h3>
          )}
          <p className="text-sm text-gray-500 line-clamp-3">{moment.content}</p>
        </div>

        {/* Image Display */}
        {moment.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden border border-gray-200">
            <img
              src={moment.image_url}
              alt={moment.title || "Moment image"}
              className="w-full object-contain bg-gray-50"
              style={{ maxHeight: '400px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Tags */}
        {moment.tags && moment.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {moment.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-amber-100 hover:text-amber-700 transition-colors">
                #{tag}
              </span>
            ))}
            {moment.tags.length > 3 && (
              <span className="px-2 py-1 text-gray-400 text-xs">+{moment.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Reaction Bar */}
        <ReactionBar
          moment={moment}
          onReact={(type, isActive) => { console.log('Reaction:', type, isActive); }}
          onComment={() => {}}
          onSave={(isSaved) => { console.log('Save:', isSaved); }}
        />
      </div>
    </Link>
  );
}

export default MomentCard;
