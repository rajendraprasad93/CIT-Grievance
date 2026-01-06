import { useState } from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

/**
 * ProfileVisitors Component - Tier 2: Profile Visitors Tracking
 * Shows who viewed your profile
 */
function ProfileVisitors({ isOwnProfile = false }) {
  // Mock data - replace with API
  const [visitors] = useState([
    {
      id: 1,
      name: 'Priya Sharma',
      department: 'CSE',
      year: 3,
      visitedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      isNew: true,
    },
    {
      id: 2,
      name: 'Rohit Kumar',
      department: 'ECE',
      year: 2,
      visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isNew: true,
    },
    {
      id: 3,
      name: 'Neha Patel',
      department: 'CSE',
      year: 3,
      visitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isNew: false,
    },
  ]);

  if (!isOwnProfile) {
    return null; // Only show on own profile
  }

  const newVisitorsCount = visitors.filter(v => v.isNew).length;

  return (
    <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">Profile Visitors</h3>
            {newVisitorsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {newVisitorsCount} new {newVisitorsCount === 1 ? 'visitor' : 'visitors'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
          <TrendingUp size={14} />
          {visitors.length}
        </div>
      </div>

      <div className="space-y-3">
        {visitors.map((visitor) => (
          <Link
            key={visitor.id}
            to={`/profile/${visitor.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg ring-2 ring-primary/20">
                {visitor.name.charAt(0)}
              </div>
              {visitor.isNew && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive border-2 border-white animate-pulse-subtle" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                {visitor.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {visitor.department} • Year {visitor.year}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(visitor.visitedAt, { addSuffix: true })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/profile/visitors"
        className="block mt-4 text-center text-sm text-primary font-medium hover:underline"
      >
        View all visitors →
      </Link>
    </div>
  );
}

export default ProfileVisitors;
