import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, MessageSquare, BarChart3, Bell, Vote, Calendar, Briefcase, Plus,
  Building, MapPin, Clock, DollarSign, GraduationCap, Link as LinkIcon,
  XCircle, RefreshCw, CheckCircle, ChevronDown, AlertCircle
} from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api';

function TeacherDashboard() {
  const { user } = useOutletContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opportunitiesCount, setOpportunitiesCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [showClassSelector, setShowClassSelector] = useState(false);

  // Opportunity modal state
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    description: '',
    opp_type: 'internship',
    organization: '',
    location: '',
    duration: '',
    stipend: '',
    eligibility: '',
    department: [],
    year: [],
    deadline: '',
    link: ''
  });
  const [opportunitySubmitting, setOpportunitySubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchOpportunitiesCount();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/api/teacher/dashboard');
      console.log('Teacher dashboard data:', data);
      
      if (data.has_classes) {
        setDashboardData(data);
        setClasses(data.classes || []);
        setActiveClass(data.active_class);
      } else {
        setError('No classes assigned. Please contact admin to assign classes.');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSwitch = async (classId) => {
    try {
      await apiPost('/api/teacher/classes/switch', { class_id: classId });
      await fetchDashboardData();
      setShowClassSelector(false);
    } catch (err) {
      console.error('Error switching class:', err);
      alert('Failed to switch class: ' + err.message);
    }
  };

  const fetchOpportunitiesCount = async () => {
    try {
      const data = await apiGet('/api/opportunities');
      setOpportunitiesCount(data.length || 0);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
  };

  const handleOpportunitySubmit = async (e) => {
    e.preventDefault();
    setOpportunitySubmitting(true);
    
    try {
      if (!opportunityForm.title || !opportunityForm.description || !opportunityForm.opp_type) {
        alert('Please fill in all required fields (Title, Description, Type)');
        setOpportunitySubmitting(false);
        return;
      }
      
      const response = await apiPost('/api/teacher/opportunities', opportunityForm);
      console.log('Opportunity created:', response);
      
      // Reset form and close modal
      setOpportunityForm({
        title: '',
        description: '',
        opp_type: 'internship',
        organization: '',
        location: '',
        duration: '',
        stipend: '',
        eligibility: '',
        department: [],
        year: [],
        deadline: '',
        link: ''
      });
      setShowOpportunityModal(false);
      
      // Refresh count
      fetchOpportunitiesCount();
      
      alert('✅ Opportunity created successfully!');
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert(`Failed to create opportunity: ${error.message}`);
    } finally {
      setOpportunitySubmitting(false);
    }
  };

  const handleOpportunityFormChange = (field, value) => {
    setOpportunityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
                Teacher Dashboard
              </h1>
              <p className="text-white/80">
                Welcome back, {user?.name || 'Teacher'}
              </p>
            </div>
            
            {/* Class Selector */}
            {classes.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowClassSelector(!showClassSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors text-gray-900"
                >
                  <span className="text-sm font-medium">
                    {activeClass?.class_name || 'Select Class'}
                  </span>
                  <ChevronDown size={16} />
                </button>
                
                {showClassSelector && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <p className="text-xs text-gray-500 px-3 py-2 font-medium">Switch Class</p>
                      {classes.map((cls) => (
                        <button
                          key={cls.class_id}
                          onClick={() => handleClassSwitch(cls.class_id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeClass?.class_id === cls.class_id
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-medium">{cls.class_name}</div>
                          <div className="text-xs opacity-70">{cls.student_count || 0} students</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-amber-500" size={32} />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <AlertCircle className="mx-auto text-amber-600 mb-3" size={48} />
            <h3 className="text-lg font-semibold text-amber-800 mb-2">No Classes Assigned</h3>
            <p className="text-amber-700">{error}</p>
          </div>
        </div>
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile & Classroom Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Teacher Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-4 mb-4">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'T'}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg text-gray-900">{user?.name || 'Teacher Name'}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                  Teacher
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {activeClass?.department || user?.department || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Classes:</span> {classes.length}
              </p>
            </div>
          </div>

          {/* Classroom Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Users className="text-amber-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Active Classroom</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{activeClass?.class_name || 'No Class Selected'}</p>
              <p className="text-sm text-gray-600">Year {activeClass?.current_year || '-'}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-3xl font-bold text-amber-500">{dashboardData?.stats?.total_students || 0}</span>
                <span className="text-sm text-gray-500">Students</span>
              </div>
            </div>
          </div>

          {/* Opportunities Card - NEW */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Briefcase className="text-amber-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Opportunities</h3>
              </div>
              <button
                onClick={() => setShowOpportunityModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
                title="Add new opportunity"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-amber-600">{opportunitiesCount}</p>
              <p className="text-sm text-gray-600">Total Opportunities</p>
              <p className="text-xs text-gray-500 mt-2">
                Share internships, scholarships, and workshops with students
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Bell className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.total_announcements || 0}</p>
                <p className="text-xs text-gray-500">Announcements</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Vote className="text-orange-600" size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.total_polls || 0}</p>
                <p className="text-xs text-gray-500">Polls Created</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <BarChart3 className="text-emerald-600" size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{dashboardData?.stats?.avg_attendance || 0}%</p>
                <p className="text-xs text-gray-500">Avg Attendance</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Users className="text-amber-600" size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.total_students || 0}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell size={18} />
                Recent Announcements
              </h3>
              <a href="/teacher/forum" className="text-sm text-amber-600 hover:underline">View All</a>
            </div>
            <div className="divide-y divide-gray-100">
              {(dashboardData?.recent_announcements || []).length > 0 ? (
                dashboardData.recent_announcements.map((announcement) => (
                  <div key={announcement.announcement_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="font-medium text-gray-800 mb-1">{announcement.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      <span>{announcement.views_count || 0} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No announcements yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Polls */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Vote size={18} />
                Polls
              </h3>
              <a href="/teacher/forum" className="text-sm text-amber-600 hover:underline">Manage</a>
            </div>
            <div className="divide-y divide-gray-100">
              {(dashboardData?.active_polls || []).length > 0 ? (
                dashboardData.active_polls.map((poll) => (
                  <div key={poll.poll_id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-800 mb-1">{poll.question}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        poll.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {poll.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{poll.total_votes || 0} votes</span>
                      {poll.ends_at && <span>Ends: {new Date(poll.ends_at).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Vote size={32} className="mx-auto mb-2 opacity-30" />
                  <p>No active polls</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Add Opportunity Modal */}
      {showOpportunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase size={28} className="text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold">Add New Opportunity</h2>
                    <p className="text-gray-300">Share opportunities with your students</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOpportunityModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleOpportunitySubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={opportunityForm.title}
                    onChange={(e) => handleOpportunityFormChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Summer Internship at Google"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={opportunityForm.opp_type}
                    onChange={(e) => handleOpportunityFormChange('opp_type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="internship">💼 Internship</option>
                    <option value="scholarship">🎓 Scholarship</option>
                    <option value="workshop">🛠️ Workshop</option>
                    <option value="event">📅 Event</option>
                    <option value="resource">📚 Resource</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={opportunityForm.description}
                    onChange={(e) => handleOpportunityFormChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={4}
                    placeholder="Describe the opportunity, requirements, and benefits..."
                    required
                  />
                </div>

                {/* Organization & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building size={14} className="inline mr-1" />
                      Organization
                    </label>
                    <input
                      type="text"
                      value={opportunityForm.organization}
                      onChange={(e) => handleOpportunityFormChange('organization', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Google, Microsoft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin size={14} className="inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={opportunityForm.location}
                      onChange={(e) => handleOpportunityFormChange('location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., Bangalore, Remote"
                    />
                  </div>
                </div>

                {/* Duration & Stipend */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock size={14} className="inline mr-1" />
                      Duration
                    </label>
                    <input
                      type="text"
                      value={opportunityForm.duration}
                      onChange={(e) => handleOpportunityFormChange('duration', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., 3 months, 6 weeks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign size={14} className="inline mr-1" />
                      Stipend/Compensation
                    </label>
                    <input
                      type="text"
                      value={opportunityForm.stipend}
                      onChange={(e) => handleOpportunityFormChange('stipend', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="e.g., ₹50,000/month, Free"
                    />
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <GraduationCap size={14} className="inline mr-1" />
                    Eligibility/Requirements
                  </label>
                  <input
                    type="text"
                    value={opportunityForm.eligibility}
                    onChange={(e) => handleOpportunityFormChange('eligibility', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., 3rd/4th year CSE students, GPA 3.5+"
                  />
                </div>

                {/* Deadline & Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={opportunityForm.deadline}
                      onChange={(e) => handleOpportunityFormChange('deadline', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <LinkIcon size={14} className="inline mr-1" />
                      Application Link
                    </label>
                    <input
                      type="url"
                      value={opportunityForm.link}
                      onChange={(e) => handleOpportunityFormChange('link', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Departments (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'All Departments'].map(dept => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => {
                          if (dept === 'All Departments') {
                            handleOpportunityFormChange('department', []);
                          } else {
                            const current = opportunityForm.department || [];
                            if (current.includes(dept)) {
                              handleOpportunityFormChange('department', current.filter(d => d !== dept));
                            } else {
                              handleOpportunityFormChange('department', [...current, dept]);
                            }
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          (dept === 'All Departments' && (!opportunityForm.department || opportunityForm.department.length === 0)) ||
                          (opportunityForm.department && opportunityForm.department.includes(dept))
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Year (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          const current = opportunityForm.year || [];
                          if (current.includes(year)) {
                            handleOpportunityFormChange('year', current.filter(y => y !== year));
                          } else {
                            handleOpportunityFormChange('year', [...current, year]);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          opportunityForm.year && opportunityForm.year.includes(year)
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Year {year}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleOpportunityFormChange('year', [])}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !opportunityForm.year || opportunityForm.year.length === 0
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Years
                    </button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={18} className="text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Verified Opportunity</p>
                      <p className="text-xs text-emerald-700">
                        Opportunities created by teachers are automatically marked as verified and will display a verification badge to students.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOpportunityModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={opportunitySubmitting}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {opportunitySubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Opportunity
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
