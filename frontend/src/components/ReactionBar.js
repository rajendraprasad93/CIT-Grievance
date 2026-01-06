import { useState } from 'react';
import { MessageCircle, Bookmark, HandHeart, Frown, Hand, Calendar } from 'lucide-react';

/**
 * ReactionBar Component - HelloTalk-style reactions
 * Supports different reaction types based on moment category
 */
function ReactionBar({ moment, onReact, onComment, onSave }) {
  const [reactions, setReactions] = useState({
    helpful: moment.reactions?.helpful || 0,
    affected: moment.reactions?.affected || 0,
    canHelp: moment.reactions?.canHelp || 0,
    attending: moment.reactions?.attending || 0,
  });
  const [userReactions, setUserReactions] = useState({
    helpful: false,
    affected: false,
    canHelp: false,
    attending: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleReaction = (type) => {
    const isActive = userReactions[type];
    
    setUserReactions({
      ...userReactions,
      [type]: !isActive,
    });
    
    setReactions({
      ...reactions,
      [type]: isActive ? reactions[type] - 1 : reactions[type] + 1,
    });

    if (onReact) {
      onReact(type, !isActive);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(!isSaved);
    }
  };

  // Get reactions based on moment type
  const getReactionsForType = () => {
    const momentType = moment.moment_type;
    
    const baseReactions = [
      {
        type: 'helpful',
        icon: <HandHeart size={16} />,
        emoji: '😍',
        label: 'Helpful',
        count: reactions.helpful,
        active: userReactions.helpful,
        color: 'opportunity',
        show: true,
      },
      {
        type: 'comments',
        icon: <MessageCircle size={16} />,
        label: 'Comments',
        count: moment.comments_count || 0,
        color: 'primary',
        show: true,
        onClick: onComment,
      },
    ];

    // Add type-specific reactions
    if (momentType === 'help') {
      baseReactions.splice(2, 0, {
        type: 'canHelp',
        icon: <Hand size={16} />,
        emoji: '🙋‍♂️',
        label: 'I can help',
        count: reactions.canHelp,
        active: userReactions.canHelp,
        color: 'help',
        show: true,
      });
    }

    if (momentType === 'issue_observation') {
      baseReactions.splice(2, 0, {
        type: 'affected',
        icon: <Frown size={16} />,
        emoji: '😕',
        label: 'Affected',
        count: reactions.affected,
        active: userReactions.affected,
        color: 'issue',
        show: true,
      });
    }

    if (momentType === 'campus_life' && moment.tags?.includes('event')) {
      baseReactions.splice(2, 0, {
        type: 'attending',
        icon: <Calendar size={16} />,
        emoji: '🎯',
        label: 'Attending',
        count: reactions.attending,
        active: userReactions.attending,
        color: 'life',
        show: true,
      });
    }

    return baseReactions.filter(r => r.show);
  };

  const reactionButtons = getReactionsForType();

  return (
    <div className="flex items-center gap-3 pt-3 border-t border-border/50">
      {reactionButtons.map((reaction) => (
        <button
          key={reaction.type}
          onClick={(e) => {
            e.preventDefault();
            if (reaction.onClick) {
              reaction.onClick();
            } else {
              handleReaction(reaction.type);
            }
          }}
          className={`flex items-center gap-1.5 text-sm transition-all group/btn ${
            reaction.active
              ? `text-${reaction.color} font-semibold`
              : 'text-muted-foreground hover:text-' + reaction.color
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              reaction.active
                ? `bg-${reaction.color}/20 scale-110`
                : `bg-${reaction.color}/10 group-hover/btn:bg-${reaction.color}/20`
            }`}
          >
            {reaction.emoji ? (
              <span className="text-base group-hover/btn:scale-110 transition-transform">
                {reaction.emoji}
              </span>
            ) : (
              <div className="group-hover/btn:scale-110 transition-transform">
                {reaction.icon}
              </div>
            )}
          </div>
          <span className="font-medium text-xs sm:text-sm">
            {reaction.count > 0 ? reaction.count : ''}
            {reaction.label && reaction.count === 0 ? reaction.label : ''}
          </span>
        </button>
      ))}

      {/* Save Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className={`flex items-center gap-1.5 text-sm transition-all group/btn ml-auto ${
          isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-primary/20 scale-110'
              : 'bg-primary/10 group-hover/btn:bg-primary/20'
          }`}
        >
          <Bookmark
            size={16}
            className={`group-hover/btn:scale-110 transition-transform ${
              isSaved ? 'fill-current' : ''
            }`}
          />
        </div>
      </button>

      {/* Read More Arrow */}
      <span className="text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
        →
      </span>
    </div>
  );
}

export default ReactionBar;
