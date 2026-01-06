import { TrendingUp, Heart, MessageCircle, Award } from 'lucide-react';

/**
 * ReputationScore Component - Tier 6: Trust & Reputation
 * Shows user's contribution and helpfulness score
 */
function ReputationScore({ stats, compact = false }) {
  const {
    helpfulCount = 0,
    issuesResolved = 0,
    resourcesShared = 0,
    totalContributions = 0,
  } = stats || {};

  const reputationScore = helpfulCount + (issuesResolved * 5) + (resourcesShared * 2);
  
  const getReputationLevel = (score) => {
    if (score >= 100) return { level: 'Campus Hero', color: 'text-opportunity', bg: 'bg-opportunity/10' };
    if (score >= 50) return { level: 'Active Helper', color: 'text-primary', bg: 'bg-primary/10' };
    if (score >= 20) return { level: 'Contributor', color: 'text-help', bg: 'bg-help/10' };
    return { level: 'New Member', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  const reputation = getReputationLevel(reputationScore);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${reputation.bg} ${reputation.color} text-xs font-semibold`}>
          <TrendingUp size={12} />
          {reputationScore}
        </div>
        <span className="text-xs text-muted-foreground">{reputation.level}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-bold text-lg mb-1">Reputation Score</h3>
          <p className="text-sm text-muted-foreground">Your campus contribution</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{reputationScore}</div>
          <div className={`text-xs font-semibold ${reputation.color}`}>{reputation.level}</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Helpful Reactions */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-opportunity/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-opportunity/10 flex items-center justify-center">
              <Heart size={18} className="text-opportunity" />
            </div>
            <div>
              <p className="font-semibold text-sm">Helpful Reactions</p>
              <p className="text-xs text-muted-foreground">People found you helpful</p>
            </div>
          </div>
          <span className="text-xl font-bold text-opportunity">{helpfulCount}</span>
        </div>

        {/* Issues Resolved */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-life/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-life/10 flex items-center justify-center">
              <Award size={18} className="text-life" />
            </div>
            <div>
              <p className="font-semibold text-sm">Issues Resolved</p>
              <p className="text-xs text-muted-foreground">Helped fix campus issues</p>
            </div>
          </div>
          <span className="text-xl font-bold text-life">{issuesResolved}</span>
        </div>

        {/* Resources Shared */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-help/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-help/10 flex items-center justify-center">
              <MessageCircle size={18} className="text-help" />
            </div>
            <div>
              <p className="font-semibold text-sm">Resources Shared</p>
              <p className="text-xs text-muted-foreground">Notes, links, and tips</p>
            </div>
          </div>
          <span className="text-xl font-bold text-help">{resourcesShared}</span>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">NEXT LEVEL</span>
          <span className="text-xs font-semibold text-primary">
            {reputationScore >= 100 ? 'Max Level!' : `${Math.max(0, (reputationScore >= 50 ? 100 : reputationScore >= 20 ? 50 : 20) - reputationScore)} points to go`}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-opportunity transition-all duration-500"
            style={{
              width: `${Math.min(100, (reputationScore / (reputationScore >= 50 ? 100 : reputationScore >= 20 ? 50 : 20)) * 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ReputationScore;
