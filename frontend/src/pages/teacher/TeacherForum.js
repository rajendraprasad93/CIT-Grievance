import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Bell, Vote, Edit2, Trash2, X, Check, Users } from 'lucide-react';

// Mock data
const mockAnnouncements = [
  { 
    id: 1, 
    title: 'Mid-semester exam schedule released', 
    content: 'The mid-semester exams will be held from January 15-20. Please check the detailed schedule on the notice board.',
    date: '2026-01-07',
    views: 38 
  },
  { 
    id: 2, 
    title: 'Project submission deadline extended', 
    content: 'Due to multiple requests, the project submission deadline has been extended to January 25th.',
    date: '2026-01-05',
    views: 42 
  },
  { 
    id: 3, 
    title: 'Guest lecture on AI/ML tomorrow', 
    content: 'We have a guest lecture by Dr. Ramesh from IIT Madras on "Future of AI in Healthcare" at 2 PM in Seminar Hall.',
    date: '2026-01-03',
    views: 35 
  },
];

const mockPolls = [
  { 
    id: 1, 
    question: 'Preferred time for extra class?', 
    options: [
      { id: 1, text: 'Morning (8-9 AM)', votes: 12 },
      { id: 2, text: 'Afternoon (2-3 PM)', votes: 8 },
      { id: 3, text: 'Evening (4-5 PM)', votes: 12 },
    ],
    totalVotes: 32, 
    status: 'active', 
    endsAt: '2026-01-10' 
  },
  { 
    id: 2, 
    question: 'Topic for next workshop', 
    options: [
      { id: 1, text: 'Web Development', votes: 15 },
      { id: 2, text: 'Machine Learning', votes: 8 },
      { id: 3, text: 'Mobile App Dev', votes: 5 },
    ],
    totalVotes: 28, 
    status: 'closed', 
    endsAt: '2026-01-06' 
  },
];

function TeacherForum() {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [polls, setPolls] = useState(mockPolls);
  
  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''], endsAt: '' });

  const handleCreateAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) return;
    
    const newAnnouncement = {
      id: Date.now(),
      title: announcementForm.title,
      content: announcementForm.content,
      date: new Date().toISOString().split('T')[0],
      views: 0
    };
    
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(a => 
        a.id === editingAnnouncement.id ? { ...newAnnouncement, id: a.id, views: a.views } : a
      ));
    } else {
      setAnnouncements([newAnnouncement, ...announcements]);
    }
    
    setAnnouncementForm({ title: '', content: '' });
    setEditingAnnouncement(null);
    setShowAnnouncementModal(false);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({ title: announcement.title, content: announcement.content });
    setShowAnnouncementModal(true);
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleCreatePoll = () => {
    if (!pollForm.question || pollForm.options.filter(o => o.trim()).length < 2) return;
    
    const newPoll = {
      id: Date.now(),
      question: pollForm.question,
      options: pollForm.options.filter(o => o.trim()).map((text, idx) => ({
        id: idx + 1,
        text,
        votes: 0
      })),
      totalVotes: 0,
      status: 'active',
      endsAt: pollForm.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    setPolls([newPoll, ...polls]);
    setPollForm({ question: '', options: ['', ''], endsAt: '' });
    setShowPollModal(false);
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

  const closePoll = (pollId) => {
    setPolls(polls.map(p => p.id === pollId ? { ...p, status: 'closed' } : p));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-cit-navy text-white py-8">
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
                ? 'bg-cit-navy text-white'
                : 'bg-white text-cit-navy border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Bell size={18} />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
              activeTab === 'polls'
                ? 'bg-cit-navy text-white'
                : 'bg-white text-cit-navy border border-gray-200 hover:bg-gray-50'
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
              <h2 className="text-lg font-semibold text-cit-navy">All Announcements</h2>
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm({ title: '', content: '' });
                  setShowAnnouncementModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-cit-gold text-cit-navy rounded-lg font-semibold hover:bg-cit-gold/90 transition-colors"
              >
                <Plus size={18} />
                New Announcement
              </button>
            </div>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-cit-navy">{announcement.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{announcement.date}</span>
                    <span>{announcement.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-cit-navy">All Polls</h2>
              <button
                onClick={() => setShowPollModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cit-gold text-cit-navy rounded-lg font-semibold hover:bg-cit-gold/90 transition-colors"
              >
                <Plus size={18} />
                Create Poll
              </button>
            </div>

            <div className="space-y-4">
              {polls.map((poll) => (
                <div key={poll.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-cit-navy">{poll.question}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      poll.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {poll.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {poll.options.map((option) => {
                      const percentage = poll.totalVotes > 0 
                        ? Math.round((option.votes / poll.totalVotes) * 100) 
                        : 0;
                      return (
                        <div key={option.id} className="relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{option.text}</span>
                            <span className="text-sm text-gray-500">{option.votes} votes ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cit-gold rounded-full transition-all"
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
                        {poll.totalVotes} total votes
                      </span>
                      <span>Ends: {poll.endsAt}</span>
                    </div>
                    {poll.status === 'active' && (
                      <button
                        onClick={() => closePoll(poll.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Close Poll
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-cit-navy">
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
                  className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold"
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full h-32 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold resize-none"
                  placeholder="Write your announcement..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAnnouncement}
                className="flex-1 h-10 bg-cit-navy text-white rounded-lg font-semibold hover:bg-cit-navy/90 transition-colors"
              >
                {editingAnnouncement ? 'Update' : 'Post Announcement'}
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
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-cit-navy">Create Poll</h2>
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
                  className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold"
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
                      className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>
                {pollForm.options.length < 5 && (
                  <button
                    onClick={addPollOption}
                    className="mt-2 text-sm text-cit-gold hover:underline"
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
                  className="w-full h-10 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePoll}
                className="flex-1 h-10 bg-cit-navy text-white rounded-lg font-semibold hover:bg-cit-navy/90 transition-colors"
              >
                Create Poll
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
    </div>
  );
}

export default TeacherForum;
