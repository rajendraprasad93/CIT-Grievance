import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Bell, Vote, Edit2, Trash2, X, Check, Users, RefreshCw, AlertCircle, Eye, CheckCircle, Clock } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';

function TeacherForum() {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showParticipationModal, setShowParticipationModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [participationData, setParticipationData] = useState(null);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', priority: 'normal' });
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''], endsAt: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [announcementsData, pollsData] = await Promise.all([
        apiGet('/api/teacher/announcements'),
        apiGet('/api/teacher/polls')
      ]);
      setAnnouncements(announcementsData.announcements || []);
      setPolls(pollsData.polls || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) return;
    
    setSubmitting(true);
    try {
      if (editingAnnouncement) {
        await apiPut(`/api/teacher/announcements/${editingAnnouncement.announcement_id}`, announcementForm);
      } else {
        await apiPost('/api/teacher/announcements', announcementForm);
      }
      
      await fetchData();
      setAnnouncementForm({ title: '', content: '', priority: 'normal' });
      setEditingAnnouncement(null);
      setShowAnnouncementModal(false);
    } catch (err) {
      console.error('Error saving announcement:', err);
      alert('Failed to save announcement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({ 
      title: announcement.title, 
      content: announcement.content,
      priority: announcement.priority || 'normal'
    });
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await apiDelete(`/api/teacher/announcements/${id}`);
      await fetchData();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement: ' + err.message);
    }
  };

  const handleCreatePoll = async () => {
    if (!pollForm.question || pollForm.options.filter(o => o.trim()).length < 2) return;
    
    setSubmitting(true);
    try {
      await apiPost('/api/teacher/polls', {
        question: pollForm.question,
        options: pollForm.options.filter(o => o.trim()),
        ends_at: pollForm.endsAt || null
      });
      
      await fetchData();
      setPollForm({ question: '', options: ['', ''], endsAt: '' });
      setShowPollModal(false);
    } catch (err) {
      console.error('Error creating poll:', err);
      alert('Failed to create poll: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addPollOption = () => {
    if (pollForm.options.length < 5) {
      setPollForm({ ...pollForm, options: [...pollForm.options, ''] });
    }
  };

  const updatePollOption = (index, value) => {
    const newOptions = [...pollForm.options];
    newOptions[index] = value;
    setPollForm({ ...pollForm, options: newOptions });
  };

  const closePoll = async (pollId) => {
    try {
      await apiPost(`/api/teacher/polls/${pollId}/close`);
      await fetchData();
    } catch (err) {
      console.error('Error closing poll:', err);
      alert('Failed to close poll: ' + err.message);
    }
  };

  const viewParticipation = async (pollId) => {
    setLoadingParticipation(true);
    setShowParticipationModal(true);
    try {
      const data = await apiGet(`/api/teacher/polls/${pollId}/participation`);
      setParticipationData(data);
    } catch (err) {
      console.error('Error fetching participation:', err);
      alert('Failed to load participation data: ' + err.message);
      setShowParticipationModal(false);
    } finally {
      setLoadingParticipation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <RefreshCw className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
            Classroom Forum
          </h1>
          <p className="text-white/80">
            Post announcements and create polls for your students
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'announcements'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Bell size={18} />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'polls'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Vote size={18} />
            Polls
          </button>
        </div>

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All Announcements</h2>
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm({ title: '', content: '' });
                  setShowAnnouncementModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
              >
                <Plus size={18} />
                New Announcement
              </button>
            </div>

            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.announcement_id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{announcement.title}</h3>
                        {announcement.priority !== 'normal' && (
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                            announcement.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {announcement.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAnnouncement(announcement)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.announcement_id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      <span>{announcement.views_count || 0} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No announcements yet. Create your first announcement!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All Polls</h2>
              <button
                onClick={() => setShowPollModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
              >
                <Plus size={18} />
                Create Poll
              </button>
            </div>

            <div className="space-y-4">
              {polls.length > 0 ? (
                polls.map((poll) => (
                  <div key={poll.poll_id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-lg text-gray-900">{poll.question}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        poll.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {poll.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {(poll.options || []).map((option, idx) => {
                        const percentage = poll.total_votes > 0 
                          ? Math.round((option.votes / poll.total_votes) * 100) 
                          : 0;
                        return (
                          <div key={idx} className="relative">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{option.text}</span>
                              <span className="text-sm text-gray-500">{option.votes} votes ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {poll.total_votes || 0} total votes
                        </span>
                        {poll.ends_at && <span>Ends: {new Date(poll.ends_at).toLocaleDateString()}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => viewParticipation(poll.poll_id)}
                          className="flex items-center gap-1 text-sm text-amber-600 hover:underline"
                        >
                          <Eye size={14} />
                          View Participation
                        </button>
                        {poll.status === 'active' && (
                          <button
                            onClick={() => closePoll(poll.poll_id)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Close Poll
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Vote size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No polls yet. Create your first poll!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button onClick={() => setShowAnnouncementModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  placeholder="Write your announcement..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAnnouncement}
                disabled={submitting}
                className="flex-1 h-10 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Post Announcement')}
              </button>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-6 h-10 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create Poll</h2>
              <button onClick={() => setShowPollModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={pollForm.question}
                  onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Ask a question..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {pollForm.options.map((option, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      className="w-full h-10 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>
                {pollForm.options.length < 5 && (
                  <button
                    onClick={addPollOption}
                    className="mt-2 text-sm text-amber-600 hover:underline"
                  >
                    + Add Option
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={pollForm.endsAt}
                  onChange={(e) => setPollForm({ ...pollForm, endsAt: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePoll}
                disabled={submitting}
                className="flex-1 h-10 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Poll'}
              </button>
              <button
                onClick={() => setShowPollModal(false)}
                className="px-6 h-10 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participation Modal */}
      {showParticipationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Poll Participation</h2>
              <button 
                onClick={() => {
                  setShowParticipationModal(false);
                  setParticipationData(null);
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            {loadingParticipation ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-amber-500" size={32} />
              </div>
            ) : participationData ? (
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {/* Poll Question */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {participationData.poll?.question}
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                      {participationData.participation_rate}% participation
                    </span>
                    <span className="text-gray-500">
                      {participationData.voted_count} of {participationData.total_students} students voted
                    </span>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{participationData.total_students}</p>
                    <p className="text-xs text-gray-500">Total Students</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{participationData.voted_count}</p>
                    <p className="text-xs text-gray-500">Voted</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{participationData.not_voted_count}</p>
                    <p className="text-xs text-gray-500">Not Voted</p>
                  </div>
                </div>

                {/* Tabs for Voted / Not Voted */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Voted List */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-3">
                      <CheckCircle size={18} />
                      Voted ({participationData.voted_count})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {participationData.voters?.length > 0 ? (
                        participationData.voters.map((voter, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-gray-800">{voter.name}</p>
                              <p className="text-xs text-gray-500">{voter.email}</p>
                            </div>
                            <span className="text-xs text-green-600">
                              {new Date(voter.voted_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No votes yet</p>
                      )}
                    </div>
                  </div>

                  {/* Not Voted List */}
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold text-yellow-700 mb-3">
                      <Clock size={18} />
                      Not Voted ({participationData.not_voted_count})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {participationData.non_voters?.length > 0 ? (
                        participationData.non_voters.map((student, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-gray-800">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.roll_number || student.email}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Everyone has voted!</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherForum;
