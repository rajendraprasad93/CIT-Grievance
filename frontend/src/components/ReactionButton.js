import { useState } from 'react';
import { Heart, ThumbsUp, CheckCircle, Users } from 'lucide-react';

const REACTION_TYPES = {
  helpful: { icon: ThumbsUp, label: 'Helpful', color: 'text-blue-600' },
  thanks: { icon: Heart, label: 'Thanks', color: 'text-pink-600' },
  attending: { icon: CheckCircle, label: 'Attending', color: 'text-green-600' },
  affected: { icon: Users, label: 'Affected', color: 'text-orange-600' },
};

function ReactionButton({ type, count, isReacted, onReact, disabled }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const reaction = REACTION_TYPES[type];
  const Icon = reaction.icon;

  const handleClick = async () => {
    if (disabled) return;
    
    setIsAnimating(true);
    await onReact(type);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
        transition-all duration-200
        ${isReacted 
          ? `${reaction.color} bg-current/10 border border-current/20` 
          : 'text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-transparent'
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Icon size={16} className={isAnimating ? 'animate-bounce' : ''} />
      <span>{count > 0 ? count : reaction.label}</span>
    </button>
  );
}

export default ReactionButton;
