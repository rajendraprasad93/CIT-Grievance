import { Award, Flame, Target, Zap, Heart, MessageCircle, TrendingUp, Users, FileText } from 'lucide-react';

/**
 * AchievementBadges - Connected to backend
 * Gamification badges for user achievements
 */
function AchievementBadges({ badges = [], compact = false }) {
  const allBadges = {
    first_moment: {
      icon: MessageCircle,
      color: 'text-help',
      bg: 'bg-help/10',
      border: 'border-help/20',
      title: 'First Post',
      description: 'Posted your first moment',
      emoji: '🎉',
    },
    active_contributor: {
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      title: 'Active Contributor',
      description: 'Posted 10 or more moments',
      emoji: '⭐',
    },
    issue_reporter: {
      icon: FileText,
      color: 'text-issue',
      bg: 'bg-issue/10',
      border: 'border-issue/20',
      title: 'Issue Reporter',
      description: 'Reported your first campus issue',
      emoji: '📝',
    },
    helpful: {
      icon: Heart,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      border: 'border-opportunity/20',
      title: 'Helpful',
      description: 'Received 10 or more reactions',
      emoji: '💝',
    },
    popular: {
      icon: Users,
      color: 'text-life',
      bg: 'bg-life/10',
      border: 'border-life/20',
      title: 'Popular',
      description: 'Gained 50 or more followers',
      emoji: '🌟',
    },
    engaged: {
      icon: MessageCircle,
      color: 'text-help',
      bg: 'bg-help/10',
      border: 'border-help/20',
      title: 'Engaged',
      description: 'Made 20 or more comments',
      emoji: '💬',
    },
    // Legacy badges for backward compatibility
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

  // Handle both array of strings and array of badge objects from backend
  const userBadgeKeys = badges?.map(b => {
    if (typeof b === 'string') return b;
    return b.badge_type || b;
  }).filter(Boolean) || [];

  const userBadges = userBadgeKeys.map(key => allBadges[key]).filter(Boolean);

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
            {userBadges.length} unlocked
          </p>
        </div>
      </div>

      {userBadges.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No badges earned yet</p>
          <p className="text-xs text-muted-foreground mt-1">Keep contributing to earn badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {userBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 transition-all ${badge.bg} ${badge.border}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-full ${badge.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xl">{badge.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm mb-1 ${badge.color}`}>
                      {badge.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-life">
                  <Award size={12} />
                  Unlocked
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AchievementBadges;
