import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { MapPin, BookOpen, Calendar, Mail, Edit, Star, Users, MessageCircle, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet, apiPost } from "../lib/api";
import FollowButton from "../components/FollowButton";
import ProfileVisitors from "../components/ProfileVisitors";
import ReputationScore from "../components/ReputationScore";
import AchievementBadges from "../components/AchievementBadges";
import VerificationBadge from "../components/VerificationBadge";
import PeerReviewModal from "../components/PeerReviewModal";
import EditProfileModal from "../components/EditProfileModal";
import MomentCard from "../components/MomentCard";

function Profile() {
  const { user } = useOutletContext();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet(`/api/profile/${userId}`);
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, userId]);

  const handleReviewSubmit = (reviewData) => {
    console.log("Review submitted:", reviewData);
    fetchProfile();
  };

  const handleFollowChange = (isFollowing) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        is_following: isFollowing,
        stats: {
          ...profileData.stats,
          followers_count: profileData.stats.followers_count + (isFollowing ? 1 : -1)
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error || !profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-500 mb-6">This user profile doesn't exist or has been removed.</p>
          <Link to="/community" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold transition-all">
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const { user: profileUser, moments = [], issues = [], stats = {}, badges = [], average_rating = 0, is_following = false } = profileData;
  const isOwnProfile = user?.user_id === profileUser.user_id;
  const skills = typeof profileUser.skills === 'string' ? JSON.parse(profileUser.skills || '[]') : (profileUser.skills || []);
  const interests = typeof profileUser.interests === 'string' ? JSON.parse(profileUser.interests || '[]') : (profileUser.interests || []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="text-center mb-6">
                {profileUser.picture ? (
                  <img src={profileUser.picture} alt={profileUser.name} className="w-28 h-28 rounded-full mx-auto ring-4 ring-amber-100 object-cover mb-4" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-4xl mx-auto ring-4 ring-amber-100 mb-4">
                    {profileUser.name.charAt(0)}
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-xl font-bold text-gray-900" data-testid="profile-name">{profileUser.name}</h1>
                  {profileUser.verification_type && <VerificationBadge type={profileUser.verification_type} size="md" />}
                </div>
                {average_rating > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm text-gray-900">{average_rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">rating</span>
                  </div>
                )}
                {profileUser.bio && <p className="text-sm text-gray-500 mb-4">{profileUser.bio}</p>}
                <div className="flex justify-center gap-6 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{stats.followers_count || 0}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{stats.following_count || 0}</div>
                    <div className="text-xs text-gray-500">Following</div>
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  {isOwnProfile ? (
                    <button onClick={() => setShowEditModal(true)} className="flex-1 h-10 px-4 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-semibold transition-all flex items-center justify-center gap-2 text-sm">
                      <Edit size={16} />Edit Profile
                    </button>
                  ) : (
                    <>
                      <FollowButton userId={profileUser.user_id} initialFollowing={is_following} onFollowChange={handleFollowChange} />
                      <button onClick={() => setShowReviewModal(true)} className="h-10 px-4 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all text-sm">Review</button>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-gray-100">
                {profileUser.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center"><BookOpen size={16} className="text-amber-600" /></div>
                    <div><p className="text-xs text-gray-500">Department</p><p className="font-semibold text-gray-900">{profileUser.department}</p></div>
                  </div>
                )}
                {profileUser.year && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center"><Calendar size={16} className="text-blue-600" /></div>
                    <div><p className="text-xs text-gray-500">Year</p><p className="font-semibold text-gray-900">Year {profileUser.year}</p></div>
                  </div>
                )}
                {profileUser.hostel && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center"><MapPin size={16} className="text-emerald-600" /></div>
                    <div><p className="text-xs text-gray-500">Hostel</p><p className="font-semibold text-gray-900">{profileUser.hostel}</p></div>
                  </div>
                )}
                {profileUser.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><Mail size={16} className="text-gray-600" /></div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-gray-500">Email</p><p className="font-semibold text-gray-900 truncate">{profileUser.email}</p></div>
                  </div>
                )}
              </div>
              {skills.length > 0 && (
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <p className="text-xs font-semibold text-gray-500 mb-3">SKILLS</p>
                  <div className="flex flex-wrap gap-2">{skills.map((skill, idx) => (<span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">{skill}</span>))}</div>
                </div>
              )}
              {interests.length > 0 && (
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <p className="text-xs font-semibold text-gray-500 mb-3">INTERESTS</p>
                  <div className="flex flex-wrap gap-2">{interests.map((interest, idx) => (<span key={idx} className="px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium">{interest}</span>))}</div>
                </div>
              )}
            </div>
            {isOwnProfile && <ProfileVisitors isOwnProfile={isOwnProfile} userId={profileUser.user_id} />}
            <ReputationScore stats={stats} />
          </div>
          <div className="lg:col-span-2 space-y-5">
            <AchievementBadges badges={badges} />
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex gap-1 p-2 border-b border-gray-100 bg-gray-50">
                {[{ id: 'overview', label: 'Overview' }, { id: 'moments', label: `Moments (${moments.length})` }, { id: 'issues', label: `Issues (${issues.length})` }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{tab.label}</button>
                ))}
              </div>
              <div className="p-5">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-amber-50 text-center border border-amber-100"><div className="text-2xl font-bold text-amber-600 mb-1">{stats.moments_count || moments.length}</div><div className="text-xs text-gray-500">Moments</div></div>
                      <div className="p-4 rounded-xl bg-blue-50 text-center border border-blue-100"><div className="text-2xl font-bold text-blue-600 mb-1">{stats.issues_count || issues.length}</div><div className="text-xs text-gray-500">Issues</div></div>
                      <div className="p-4 rounded-xl bg-emerald-50 text-center border border-emerald-100"><div className="text-2xl font-bold text-emerald-600 mb-1">{stats.reactions_received || 0}</div><div className="text-xs text-gray-500">Reactions</div></div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-4">Recent Activity</h3>
                      {moments.length === 0 && issues.length === 0 ? (<div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500 text-sm">No activity yet</p></div>) : (<div className="space-y-4">{moments.slice(0, 3).map((moment) => (<MomentCard key={moment.moment_id} moment={moment} />))}</div>)}
                    </div>
                  </div>
                )}
                {activeTab === "moments" && (<div className="space-y-4">{moments.length === 0 ? (<div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500 text-sm">No moments posted yet</p></div>) : (moments.map((moment) => (<MomentCard key={moment.moment_id} moment={moment} />)))}</div>)}
                {activeTab === "issues" && (<div className="space-y-4">{issues.length === 0 ? (<div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500 text-sm">No issues reported yet</p></div>) : (issues.map((issue) => (<Link key={issue.issue_id} to={`/issues/${issue.issue_id}`} className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"><div className="flex items-start justify-between gap-4"><div className="flex-1"><h4 className="font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">{issue.title}</h4><div className="flex items-center gap-3 text-sm text-gray-500"><span>{issue.affected_count} affected</span><span className="capitalize">{issue.status.replace("_", " ")}</span><span>{formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span></div></div></div></Link>)))}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isOwnProfile && <PeerReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} user={profileUser} onSubmit={handleReviewSubmit} />}
      {isOwnProfile && <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={profileUser} onProfileUpdated={fetchProfile} />}
    </div>
  );
}

export default Profile;
