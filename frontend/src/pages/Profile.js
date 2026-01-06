import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useOutletContext } from "react-router-dom";
import { MapPin, BookOpen, Calendar, Mail, Edit, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet } from "../lib/api";
import FollowButton from "../components/FollowButton";
import ProfileVisitors from "../components/ProfileVisitors";
import ReputationScore from "../components/ReputationScore";
import AchievementBadges from "../components/AchievementBadges";
import VerificationBadge from "../components/VerificationBadge";
import PeerReviewModal from "../components/PeerReviewModal";
import MomentCard from "../components/MomentCard";

function Profile() {
  const { user } = useOutletContext();
  const { userId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiGet(`/api/profile/${userId}`);
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData({
        user: {
          user_id: userId,
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          picture: null,
          department: "Computer Science",
          year: 3,
          hostel: "A-Block",
          role: "student",
          verification_type: "student_rep",
          bio: "Passionate about ML and helping peers with coding. Always up for study sessions!",
          skills: ["Python", "Machine Learning", "Data Structures", "DBMS"],
          interests: ["AI/ML", "Web Development", "Competitive Programming"],
          joined_at: "2024-09-01",
        },
        moments: [
          {
            moment_id: 1,
            title: "DBMS revision group forming",
            content: "Anyone free for DBMS revision in E-Block?",
            moment_type: "help",
            reactions: 12,
            comments_count: 3,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            user_name: "Priya Sharma",
            user_department: "CSE",
            user_year: 3,
            tags: ["DBMS", "Study Group"],
          },
        ],
        issues: [
          {
            issue_id: 1,
            title: "WiFi issues in common room",
            status: "in_progress",
            affected_count: 8,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
        ],
        stats: {
          helpfulCount: 42,
          issuesResolved: 3,
          resourcesShared: 8,
          totalContributions: 53,
        },
        badges: ["first_post", "helpful_hero", "streak_7"],
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, userId]);

  const handleReviewSubmit = (reviewData) => {
    console.log("Review submitted:", reviewData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-cit-navy mb-4">
            Profile not found
          </h2>
          <p className="text-gray-600 mb-6">
            This user profile doesn't exist or has been removed.
          </p>
          <Link
            to="/community"
            className="inline-flex items-center gap-2 h-11 px-6 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all shadow-button"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const { user: profileUser, moments, issues, stats, badges } = profileData;
  const isOwnProfile = user?.user_id === profileUser.user_id;

  return (
    <div className="min-h-screen bg-cit-light pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-[28px] md:text-[32px] font-heading font-bold text-white">
            Student Profile
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded border border-gray-200 p-6 shadow-card">
              {/* Avatar */}
              <div className="text-center mb-6">
                {profileUser.picture ? (
                  <img
                    src={profileUser.picture}
                    alt={profileUser.name}
                    className="w-32 h-32 rounded mx-auto ring-4 ring-cit-navy/20 object-cover mb-4"
                  />
                ) : (
                  <div className="w-32 h-32 rounded bg-cit-navy text-white flex items-center justify-center font-bold text-5xl mx-auto ring-4 ring-cit-navy/20 mb-4">
                    {profileUser.name.charAt(0)}
                  </div>
                )}

                {/* Name & Verification */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-xl font-heading font-bold text-cit-navy" data-testid="profile-name">
                    {profileUser.name}
                  </h1>
                  {profileUser.verification_type && (
                    <VerificationBadge type={profileUser.verification_type} size="md" />
                  )}
                </div>

                {/* Bio */}
                {profileUser.bio && (
                  <p className="text-sm text-gray-600 mb-4">
                    {profileUser.bio}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center">
                  {isOwnProfile ? (
                    <Link
                      to="/settings"
                      className="flex-1 h-10 px-4 rounded bg-cit-navy text-white hover:bg-[#003875] font-semibold transition-all shadow-button flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <FollowButton
                        userId={profileUser.user_id}
                        initialFollowing={false}
                      />
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="h-10 px-4 rounded border-2 border-cit-navy text-cit-navy hover:bg-cit-navy/5 font-semibold transition-all"
                      >
                        Review
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                {profileUser.department && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-cit-navy/10 flex items-center justify-center">
                      <BookOpen size={16} className="text-cit-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Department</p>
                      <p className="font-semibold text-cit-navy">{profileUser.department}</p>
                    </div>
                  </div>
                )}

                {profileUser.year && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-cit-gold/20 flex items-center justify-center">
                      <Calendar size={16} className="text-cit-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Year</p>
                      <p className="font-semibold text-cit-navy">Year {profileUser.year}</p>
                    </div>
                  </div>
                )}

                {profileUser.hostel && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-cit-gold/20 flex items-center justify-center">
                      <MapPin size={16} className="text-cit-navy" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hostel</p>
                      <p className="font-semibold text-cit-navy">{profileUser.hostel}</p>
                    </div>
                  </div>
                )}

                {profileUser.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded bg-cit-navy/10 flex items-center justify-center">
                      <Mail size={16} className="text-cit-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-cit-navy truncate">{profileUser.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {profileUser.skills && profileUser.skills.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-3">SKILLS</p>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded bg-cit-navy/10 text-cit-navy text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profileUser.interests && profileUser.interests.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-3">INTERESTS</p>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded bg-cit-gold/20 text-cit-navy text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Visitors (Own Profile Only) */}
            {isOwnProfile && <ProfileVisitors isOwnProfile={isOwnProfile} />}

            {/* Reputation Score */}
            <ReputationScore stats={stats} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Achievement Badges */}
            <AchievementBadges badges={badges} />

            {/* Tabs */}
            <div className="bg-white rounded border border-gray-200 shadow-card overflow-hidden">
              <div className="flex gap-1 p-2 border-b border-gray-200 bg-cit-light">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 px-4 py-2.5 rounded font-semibold transition-all text-sm ${
                    activeTab === "overview"
                      ? "bg-white text-cit-navy shadow-sm"
                      : "text-gray-500 hover:text-cit-navy"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("moments")}
                  className={`flex-1 px-4 py-2.5 rounded font-semibold transition-all text-sm ${
                    activeTab === "moments"
                      ? "bg-white text-cit-navy shadow-sm"
                      : "text-gray-500 hover:text-cit-navy"
                  }`}
                >
                  Moments ({moments.length})
                </button>
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`flex-1 px-4 py-2.5 rounded font-semibold transition-all text-sm ${
                    activeTab === "issues"
                      ? "bg-white text-cit-navy shadow-sm"
                      : "text-gray-500 hover:text-cit-navy"
                  }`}
                >
                  Issues ({issues.length})
                </button>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded bg-cit-navy/5 text-center">
                        <div className="text-3xl font-bold text-cit-navy mb-1">
                          {moments.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Moments Posted
                        </div>
                      </div>
                      <div className="p-4 rounded bg-cit-gold/10 text-center">
                        <div className="text-3xl font-bold text-cit-navy mb-1">
                          {issues.length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Issues Reported
                        </div>
                      </div>
                      <div className="p-4 rounded bg-green-50 text-center">
                        <div className="text-3xl font-bold text-green-700 mb-1">
                          {issues.filter((i) => i.status === "resolved").length}
                        </div>
                        <div className="text-xs text-gray-500">
                          Issues Resolved
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-cit-navy mb-4">
                        Recent Activity
                      </h3>
                      {moments.length === 0 && issues.length === 0 ? (
                        <div className="text-center py-12 bg-cit-light rounded">
                          <p className="text-gray-500">No activity yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {moments.slice(0, 3).map((moment) => (
                            <MomentCard key={moment.moment_id} moment={moment} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Moments Tab */}
                {activeTab === "moments" && (
                  <div className="space-y-4">
                    {moments.length === 0 ? (
                      <div className="text-center py-12 bg-cit-light rounded">
                        <p className="text-gray-500">No moments posted yet</p>
                      </div>
                    ) : (
                      moments.map((moment) => (
                        <MomentCard key={moment.moment_id} moment={moment} />
                      ))
                    )}
                  </div>
                )}

                {/* Issues Tab */}
                {activeTab === "issues" && (
                  <div className="space-y-4">
                    {issues.length === 0 ? (
                      <div className="text-center py-12 bg-cit-light rounded">
                        <p className="text-gray-500">No issues reported yet</p>
                      </div>
                    ) : (
                      issues.map((issue) => (
                        <Link
                          key={issue.issue_id}
                          to={`/issues/${issue.issue_id}`}
                          className="block p-4 bg-cit-light rounded hover:bg-gray-200 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-cit-navy mb-2">{issue.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{issue.affected_count} affected</span>
                                <span className="capitalize">
                                  {issue.status.replace("_", " ")}
                                </span>
                                <span>
                                  {formatDistanceToNow(new Date(issue.created_at), {
                                    addSuffix: true,
                                  })}
                                </span>
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
        </div>
      </div>

      {/* Peer Review Modal */}
      {!isOwnProfile && (
        <PeerReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          user={profileUser}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}

export default Profile;
