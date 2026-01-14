import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bell, Vote, FileText, Users, RefreshCw, AlertCircle, CheckCircle, Clock, ChevronRight, BookOpen, Calendar, User2, Briefcase } from 'lucide-react';
import { apiGet, apiPost } from '../lib/api';

function StudentClassDashboard() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('announcements'); // Default to announcements
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classMembers, setClassMembers] = useState({
    advisors: [],
    subHandlers: [],
    students: []
  });
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [voting, setVoting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // For assignment details view

  useEffect(() => {
    fetchClassData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      // Fetch all data based on the active tab
      await updateActiveTabData(activeTab);
    } catch (err) {
      console.error('Error fetching class data:', err);
      setError(err.message || 'Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const updateActiveTabData = async (tab) => {
    setLoading(true);
    try {
      switch(tab) {
        case 'announcements':
          const announcementsData = await apiGet('/api/student/announcements');
          setAnnouncements(Array.isArray(announcementsData?.announcements) ? announcementsData.announcements : []);
          setPolls(Array.isArray(announcementsData?.polls) ? announcementsData.polls : []);
          break;
        case 'assignments':
          const assignmentsData = await apiGet('/api/student/assignments');
          setAssignments(Array.isArray(assignmentsData?.assignments) ? assignmentsData.assignments : []);
          break;
        case 'members':
          const membersData = await apiGet('/api/student/class-members');
          setClassMembers({
            advisors: Array.isArray(membersData?.advisors) ? membersData.advisors : [],
            subHandlers: Array.isArray(membersData?.sub_handlers || membersData?.subHandlers) ? (membersData.sub_handlers || membersData.subHandlers) : [],
            students: Array.isArray(membersData?.students) ? membersData.students : []
          });
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${tab} data:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    await updateActiveTabData(tab);
  };

  const handleVote = async (pollId, optionIndex) => {
    setVoting(true);
    try {
      await apiPost(`/api/student/polls/${pollId}/vote`, { option_index: optionIndex });
      // Refresh the current tab data
      await updateActiveTabData(activeTab);
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

  const submitAssignment = async (assignmentId, submissionData) => {
    try {
      await apiPost(`/api/student/assignments/${assignmentId}/submit`, submissionData);
      await updateActiveTabData('assignments');
      alert('✅ Assignment submitted successfully!');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

        {/* Sidebar Navigation */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => handleTabChange('announcements')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'announcements'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell size={18} />
                  <span>Announcements</span>
                </button>
                <button
                  onClick={() => handleTabChange('assignments')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'assignments'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText size={18} />
                  <span>Assignments</span>
                </button>
                <button
                  onClick={() => handleTabChange('members')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'members'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users size={18} />
                  <span>Class Members</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'announcements' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Bell className="text-amber-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Announcements Section */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Recent Announcements</h3>
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
            )}

            {activeTab === 'assignments' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="text-blue-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Assignments</h2>
                </div>
                
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment) => {
                      const isOverdue = new Date(assignment.due_date) < new Date();
                      const isSubmitted = assignment.submission_status === 'submitted';
                      
                      return (
                        <div key={assignment.assignment_id} className="bg-white rounded-2xl border border-gray-200 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">{assignment.title}</h3>
                            {isSubmitted ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                                <CheckCircle size={12} />Submitted
                              </span>
                            ) : isOverdue ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-lg">
                                <Clock size={12} />Overdue
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                                <Clock size={12} />Pending
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-500 text-sm mb-3">{assignment.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                            <div>
                              <span className="font-medium">Subject:</span> {assignment.subject}
                            </div>
                            <div>
                              <span className="font-medium">Due:</span> {formatDate(assignment.due_date)}
                            </div>
                          </div>
                          
                          {!isSubmitted && !isOverdue && (
                            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                              <button
                                onClick={() => setSelectedAssignment(assignment)}
                                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  const submissionText = prompt('Enter your assignment submission:');
                                  if (submissionText) {
                                    submitAssignment(assignment.assignment_id, { content: submissionText });
                                  }
                                }}
                                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                    <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">No assignments yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="text-green-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Class Members</h2>
                </div>
                
                {/* Advisors Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <User2 size={16} className="text-amber-600" />
                    Class Advisors ({classMembers.advisors.length})
                  </h3>
                  
                  {classMembers.advisors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {classMembers.advisors.map((advisor, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <User2 className="text-amber-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{advisor.name}</h4>
                            <p className="text-xs text-gray-500">{advisor.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                      <User2 size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 text-xs">No advisors assigned</p>
                    </div>
                  )}
                </div>

                {/* Sub Handlers Section */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-600" />
                    Sub Handlers ({classMembers.subHandlers.length})
                  </h3>
                  
                  {classMembers.subHandlers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {classMembers.subHandlers.map((handler, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Briefcase className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{handler.name}</h4>
                            <p className="text-xs text-gray-500">{handler.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                      <Briefcase size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 text-xs">No sub handlers assigned</p>
                    </div>
                  )}
                </div>

                {/* Students Section */}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <User2 size={16} className="text-green-600" />
                    Students ({classMembers.students.length})
                  </h3>
                  
                  {classMembers.students.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {classMembers.students.map((student, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <User2 className="text-green-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{student.name}</h4>
                            <p className="text-xs text-gray-500">{student.user_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                      <User2 size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 text-xs">No students in class</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600">{selectedAssignment.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Subject</h3>
                    <p className="text-gray-600">{selectedAssignment.subject}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Due Date</h3>
                    <p className="text-gray-600">{formatDate(selectedAssignment.due_date)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Status</h3>
                    <p className="text-gray-600 capitalize">{selectedAssignment.submission_status || 'Not submitted'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Total Marks</h3>
                    <p className="text-gray-600">{selectedAssignment.total_marks || 'Not specified'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Assigned By</h3>
                  <p className="text-gray-600">{selectedAssignment.teacher_name}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const submissionText = prompt('Enter your assignment submission:');
                    if (submissionText && selectedAssignment) {
                      submitAssignment(selectedAssignment.assignment_id, { content: submissionText });
                      setSelectedAssignment(null);
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentClassDashboard;
