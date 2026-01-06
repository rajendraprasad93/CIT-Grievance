import { Award, Flame, Target, Zap, Heart, MessageCircle, TrendingUp } from 'lucide-react';

/**
 * AchievementBadges - Tier 7: Engagement Hooks
 * Gamification badges for user achievements
 */
function AchievementBadges({ badges, compact = false }) {
  const allBadges = {
    first_post: {
      icon: MessageCircle,
      color: 'text-help',
      bg: 'bg-help/10',
      border: 'border-help/20',
      title: 'First Post',
      description: 'Posted your first moment',
      emoji: '🎉',
    },
    helpful_hero: {
      icon: Heart,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      border: 'border-opportunity/20',
      title: 'Helpful Hero',
      description: 'Received 50+ helpful reactions',
      emoji: '💝',
    },
    streak_7: {
      icon: Flame,
      color: 'text-issue',
      bg: 'bg-issue/10',
      border: 'border-issue/20',
      title: '7-Day Streak',
      description: 'Active for 7 consecutive days',
      emoji: '🔥',
    },
    problem_solver: {
      icon: Target,
      color: 'text-life',
      bg: 'bg-life/10',
      border: 'border-life/20',
      title: 'Problem Solver',
      description: 'Helped resolve 5 campus issues',
      emoji: '🎯',
    },
    top_contributor: {
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      title: 'Top Contributor',
      description: 'In top 10% of active users',
      emoji: '⭐',
    },
    early_adopter: {
      icon: Zap,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      border: 'border-opportunity/20',
      title: 'Early Adopter',
      description: 'Joined in the first month',
      emoji: '⚡',
    },
  };

  const userBadges = badges?.map(b => allBadges[b]).filter(Boolean) || [];

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {userBadges.slice(0, 3).map((badge, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded-full ${badge.bg} flex items-center justify-center`}
            title={badge.title}
          >
            <span className="text-base">{badge.emoji}</span>
          </div>
        ))}
        {userBadges.length > 3 && (
          <span className="text-xs text-muted-foreground font-medium">
            +{userBadges.length - 3} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-opportunity/10 flex items-center justify-center">
          <Award size={20} className="text-opportunity" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg">Achievements</h3>
          <p className="text-xs text-muted-foreground">
            {userBadges.length} of {Object.keys(allBadges).length} unlocked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(allBadges).map(([key, badge]) => {
          const Icon = badge.icon;
          const isUnlocked = badges?.includes(key);

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border-2 transition-all ${
                isUnlocked
                  ? `${badge.bg} ${badge.border}`
                  : 'bg-secondary/50 border-border opacity-50'
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${isUnlocked ? badge.bg : 'bg-secondary'} flex items-center justify-center flex-shrink-0`}>
                  {isUnlocked ? (
                    <span className="text-xl">{badge.emoji}</span>
                  ) : (
                    <Icon size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm mb-1 ${isUnlocked ? badge.color : 'text-muted-foreground'}`}>
                    {badge.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
              {isUnlocked && (
                <div className="flex items-center gap-1 text-xs font-semibold text-life">
                  <Award size={12} />
                  Unlocked
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">PROGRESS</span>
          <span className="text-xs font-semibold text-primary">
            {Math.round((userBadges.length / Object.keys(allBadges).length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-opportunity transition-all duration-500"
            style={{ width: `${(userBadges.length / Object.keys(allBadges).length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default AchievementBadges;
