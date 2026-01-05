import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User, MapPin, Award, BookOpen, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Profile({ user }) {
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-heading font-bold mb-4">Profile not found</h2>
          <Link to="/community" className="text-accent hover:underline">← Back to Community</Link>
        </div>
      </div>
    );
  }

  const { user: profileUser, moments, issues } = profileData;
  const isOwnProfile = user.user_id === profileUser.user_id;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-xl border border-border p-8 mb-6">
          <div className="flex items-start gap-6">
            {profileUser.picture ? (
              <img
                src={profileUser.picture}
                alt={profileUser.name}
                className="w-24 h-24 rounded-full border-4 border-accent"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-3xl">
                {profileUser.name.charAt(0)}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold mb-2" data-testid="profile-name">
                {profileUser.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {profileUser.department && (
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{profileUser.department}</span>
                  </div>
                )}
                {profileUser.hostel && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    <span>{profileUser.hostel}</span>
                  </div>
                )}
                {profileUser.year && (
                  <span>Year {profileUser.year}</span>
                )}
                {profileUser.role === 'admin' && (
                  <div className="flex items-center gap-1 text-accent">
                    <Award size={16} />
                    <span>Admin</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">{profileUser.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex gap-2 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('civic_impact')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'civic_impact'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Civic Impact
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{moments.length}</div>
                  <div className="text-sm text-muted-foreground">Moments Posted</div>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{issues.length}</div>
                  <div className="text-sm text-muted-foreground">Issues Reported</div>
                </div>
                <div className="bg-secondary rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold mb-1">{issues.filter(i => i.status === 'resolved').length}</div>
                  <div className="text-sm text-muted-foreground">Issues Resolved</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-heading font-semibold mb-3">Recent Activity</h3>
                {moments.length === 0 && issues.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {moments.slice(0, 3).map((moment) => (
                      <div key={moment.moment_id} className="p-4 bg-secondary rounded-lg">
                        <p className="font-semibold mb-1">{moment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">All Moments</h3>
              {moments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No moments posted yet</p>
              ) : (
                moments.map((moment) => (
                  <div key={moment.moment_id} className="p-4 bg-secondary rounded-lg">
                    <h4 className="font-semibold mb-2">{moment.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{moment.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{moment.reactions} reactions</span>
                      <span>{moment.comments_count} comments</span>
                      <span>{formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'civic_impact' && (
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-semibold">Issues Reported</h3>
              {issues.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No issues reported yet</p>
              ) : (
                issues.map((issue) => (
                  <Link
                    key={issue.issue_id}
                    to={`/issues/${issue.issue_id}`}
                    className="block p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">{issue.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{issue.affected_count} affected</span>
                          <span className="capitalize">{issue.status.replace('_', ' ')}</span>
                          <span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;