import { CheckCircle, Shield, Award, Star } from 'lucide-react';

/**
 * VerificationBadge Component - Tier 6: Trust & Reputation
 * Shows verification status for users
 */
function VerificationBadge({ type, size = 'sm', showLabel = false }) {
  const badges = {
    student_rep: {
      icon: Shield,
      color: 'text-primary',
      bg: 'bg-primary/10',
      label: 'Student Rep',
      emoji: '🎓',
    },
    career_verified: {
      icon: Award,
      color: 'text-opportunity',
      bg: 'bg-opportunity/10',
      label: 'Career Verified',
      emoji: '💼',
    },
    hostel_warden: {
      icon: CheckCircle,
      color: 'text-help',
      bg: 'bg-help/10',
      label: 'Hostel Warden',
      emoji: '🏠',
    },
    faculty: {
      icon: Star,
      color: 'text-issue',
      bg: 'bg-issue/10',
      label: 'Faculty',
      emoji: '👨‍🏫',
    },
    verified: {
      icon: CheckCircle,
      color: 'text-primary',
      bg: 'bg-primary/10',
      label: 'Verified',
      emoji: '✓',
    },
  };

  const badge = badges[type];
  if (!badge) return null;

  const Icon = badge.icon;
  const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;

  if (showLabel) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}>
        <Icon size={iconSize} />
        {badge.label}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${badge.bg} ${badge.color}`}
      title={badge.label}
    >
      <Icon size={iconSize} />
    </div>
  );
}

export default VerificationBadge;
