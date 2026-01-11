import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Vote, MessageSquare, Users, RefreshCw, AlertCircle, CheckCircle, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

function StudentClassDashboard() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    setLoading(true);
    setError(null);
    try {
      const classData = await apiGet('/api/student/class');
      if (!classData.has_class) {
        setError('You are not assigned to any class yet. Please contact your administrator.');
        setLoading(false);
        return;
      }
      setClassInfo(classData.class);

      const [announcementsData, pollsData] = await Promise.all([
        apiGet('/api/student/announcements'),
        apiGet('/api/student/polls')
      ]);
      
      setAnnouncements(announcementsData.announcements || []);
      setPolls(pollsData.polls || []);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError(err.message || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    setVoting(true);
    try {
      await apiPost(`/api/student/polls/${pollId}/vote`, { option_index: optionIndex });
      const pollsData = await apiGet('/api/student/polls');
      setPolls(pollsData.polls || []);
      setSelectedPoll(null);
      alert('✅ Vote submitted successfully!');
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote: ' + err.message);
    } finally {
      setVoting(false);
    }
  };

  const markAnnouncementViewed = async (announcementId) => {
    try {
      await apiPost(`/api/student/announcements/${announcementId}/view`);
    } catch (err) {
      console.error('Error marking announcement viewed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <RefreshCw className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My <span className="text-amber-600">Class</span></h1>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Assigned to a Class</h3>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-medium mb-1">Your Class 📚</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My <span className="text-amber-600">Class</span></h1>
          <p className="text-gray-500 text-sm">{classInfo?.class_name}</p>
        </div>

        {/* Class Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center">
              <BookOpen className="text-amber-600" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{classInfo?.class_name}</h2>
              <p className="text-sm text-gray-500">Department: {classInfo?.department}</p>
              <p className="text-sm text-gray-500">Year {classInfo?.current_year} • Section {classInfo?.section}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Announcements Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Bell className="text-amber-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
            </div>
            
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.announcement_id} 
                    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => markAnnouncementViewed(announcement.announcement_id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{announcement.title}</h3>
                      {announcement.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg">Important</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>By {announcement.teacher_name}</span>
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">No announcements yet</p>
              </div>
            )}
          </div>

          {/* Polls Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Vote className="text-blue-600" size={18} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Class Polls</h2>
            </div>
            
            {polls.length > 0 ? (
              <div className="space-y-4">
                {polls.map((poll) => (
                  <div key={poll.poll_id} className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{poll.question}</h3>
                      {poll.has_voted ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                          <CheckCircle size={12} />Voted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                          <Clock size={12} />Pending
                        </span>
                      )}
                    </div>
                    
                    {poll.has_voted ? (
                      <div className="space-y-2">
                        {(poll.options || []).map((option, idx) => {
                          const percentage = poll.total_votes > 0 ? Math.round((option.votes / poll.total_votes) * 100) : 0;
                          return (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{option.text}</span>
                                <span className="text-gray-500">{percentage}%</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-xs text-gray-400 mt-2">{poll.total_votes} total votes</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(poll.options || []).map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleVote(poll.poll_id, idx)}
                            disabled={voting}
                            className="w-full text-left px-4 py-3 border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-colors disabled:opacity-50 text-sm"
                          >
                            <span className="text-gray-700">{option.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                      <span>By {poll.teacher_name}</span>
                      {poll.ends_at && <span className="ml-3">Ends: {new Date(poll.ends_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <Vote size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">No active polls</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentClassDashboard;
