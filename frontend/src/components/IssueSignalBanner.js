import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * IssueSignalBanner - Tier 5: Civic Reporting
 * Shows when a moment has enough "Affected" reactions to become a tracked issue
 */
function IssueSignalBanner({ moment, affectedCount, threshold = 5 }) {
  const isSignal = affectedCount >= threshold;
  const progress = Math.min((affectedCount / threshold) * 100, 100);

  if (!moment || moment.moment_type !== 'issue_observation') {
    return null;
  }

  return (
    <div className={`rounded-2xl p-4 mb-4 border-2 transition-all ${
      isSignal
        ? 'bg-issue/10 border-issue animate-pulse-subtle'
        : 'bg-issue/5 border-issue/20'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isSignal ? 'bg-issue text-white' : 'bg-issue/20 text-issue'
        }`}>
          {isSignal ? <AlertTriangle size={20} /> : <TrendingUp size={20} />}
        </div>
        
        <div className="flex-1 min-w-0">
          {isSignal ? (
            <>
              <h4 className="font-semibold text-sm mb-1 text-issue">
                🚨 Issue Signal Created
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                This issue has been escalated to the admin dashboard for tracking. 
                You'll receive updates on its resolution.
              </p>
              <Link
                to={`/issues/${moment.signal_id || moment.moment_id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-issue hover:underline"
              >
                Track Issue #{moment.signal_id || moment.moment_id} →
              </Link>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-sm mb-1">
                Gaining Attention
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {affectedCount} of {threshold} students affected. 
                {threshold - affectedCount} more to create a tracked issue signal.
              </p>
              <div className="w-full h-2 bg-issue/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-issue transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        {isSignal && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-issue text-white text-xs font-bold whitespace-nowrap">
            <Users size={12} />
            {affectedCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueSignalBanner;
