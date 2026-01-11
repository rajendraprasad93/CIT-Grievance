import { useState, useEffect, useCallback } from 'react';
import { Eye, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { apiGet } from '../lib/api';

/**
 * ProfileVisitors Component - Connected to backend
 * Shows who viewed your profile
 */
function ProfileVisitors({ isOwnProfile = false, userId }) {
  const [visitors, setVisitors] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(async () => {
    try {
      const data = await apiGet(`/api/profile/${userId}/visitors`);
      setVisitors(data.visitors || []);
      setTotalViews(data.total_views || 0);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOwnProfile && userId) {
      fetchVisitors();
    }
  }, [isOwnProfile, userId, fetchVisitors]);

  if (!isOwnProfile) {
    return null; // Only show on own profile
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base">Profile Visitors</h3>
            <p className="text-xs text-muted-foreground">
              {totalViews} total views
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
          <TrendingUp size={14} />
          {visitors.length}
        </div>
      </div>

      {visitors.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">No visitors yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visitors.map((visitor) => (
            <Link
              key={visitor.viewer_user_id}
              to={`/profile/${visitor.viewer_user_id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
            >
              <div className="relative">
                {visitor.picture ? (
                  <img
                    src={visitor.picture}
                    alt={visitor.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg ring-2 ring-primary/20">
                    {visitor.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {visitor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {visitor.department} {visitor.year && `• Year ${visitor.year}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(visitor.viewed_at), { addSuffix: true })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileVisitors;
