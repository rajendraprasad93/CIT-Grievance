import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Users, AlertTriangle, Briefcase, MessageCircle, TrendingUp, CheckCircle, 
  Clock, XCircle, Brain, Filter, ChevronDown, ChevronUp, Layers, 
  BarChart3, Zap, AlertCircle, Info, Search, RefreshCw, Eye, Shield,
  Trash2, CheckCircle2, Flag, User, FileText, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { apiGet, apiPut } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

// Mock AI-Flagged Posts for Moderation
const mockFlaggedPosts = [
  {
    id: 'flag_001',
    postId: 'moment_abc123',
    postType: 'moment',
    content: 'This professor is absolutely useless and should be fired immediately. Worst teaching ever seen in this college. Complete waste of time attending these lectures.',
    authorName: 'Anonymous Student',
    authorRole: 'student',
    authorId: 'user_123',
    classroom: 'CSE - Section A',
    department: 'CSE',
    riskCategory: 'harassment',
    riskSeverity: 'high',
    confidenceScore: 0.89,
    flaggedAt: '2026-01-08T09:15:00Z',
    interactions: { likes: 12, comments: 8 },
    aiReasoning: 'Content contains personal attacks and derogatory language targeting faculty. High confidence of harassment based on aggressive tone and calls for termination.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null
  },
  {
    id: 'flag_002',
    postId: 'moment_def456',
    postType: 'moment',
    content: 'Feeling so overwhelmed with everything. Sometimes I wonder if it\'s even worth continuing. The pressure is just too much to handle anymore.',
    authorName: 'Priya Sharma',
    authorRole: 'student',
    authorId: 'user_456',
    classroom: 'ECE - Section B',
    department: 'ECE',
    riskCategory: 'self_harm',
    riskSeverity: 'critical',
    confidenceScore: 0.76,
    flaggedAt: '2026-01-08T08:30:00Z',
    interactions: { likes: 3, comments: 15 },
    aiReasoning: 'Content indicates potential mental health concerns with phrases suggesting hopelessness. Flagged for immediate review due to self-harm indicators.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null
  },
  {
    id: 'flag_003',
    postId: 'comment_ghi789',
    postType: 'comment',
    content: 'Students from that state are always like this. They don\'t belong here and should go back where they came from.',
    authorName: 'Rahul V',
    authorRole: 'student',
    authorId: 'user_789',
    classroom: 'Mechanical - Section A',
    department: 'Mechanical',
    riskCategory: 'hate_speech',
    riskSeverity: 'critical',
    confidenceScore: 0.94,
    flaggedAt: '2026-01-08T07:45:00Z',
    interactions: { likes: 2, comments: 4 },
    aiReasoning: 'Content contains discriminatory language targeting regional identity. Clear violation of community guidelines regarding hate speech.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null
  },
  {
    id: 'flag_004',
    postId: 'moment_jkl012',
    postType: 'moment',
    content: 'Heard from a friend that the exam paper was leaked. Everyone in Section B already has the questions. This is so unfair!',
    authorName: 'Vikram Singh',
    authorRole: 'student',
    authorId: 'user_012',
    classroom: 'CSE - Section C',
    department: 'CSE',
    riskCategory: 'misinformation',
    riskSeverity: 'medium',
    confidenceScore: 0.71,
    flaggedAt: '2026-01-07T22:00:00Z',
    interactions: { likes: 45, comments: 32 },
    aiReasoning: 'Unverified claim about exam paper leak spreading rapidly. Could cause panic and unfair accusations. Flagged as potential misinformation.',
    status: 'reviewed',
    reviewedBy: 'Admin User',
    reviewedAt: '2026-01-08T06:00:00Z'
  },
  {
    id: 'flag_005',
    postId: 'moment_mno345',
    postType: 'moment',
    content: 'That guy in our class is such a loser. Nobody should talk to him. Let\'s make sure he knows he\'s not welcome in our group.',
    authorName: 'Sneha P',
    authorRole: 'student',
    authorId: 'user_345',
    classroom: 'IT - Section A',
    department: 'IT',
    riskCategory: 'bullying',
    riskSeverity: 'high',
    confidenceScore: 0.88,
    flaggedAt: '2026-01-07T18:30:00Z',
    interactions: { likes: 8, comments: 6 },
    aiReasoning: 'Content promotes social exclusion and contains derogatory language targeting an individual. Clear indicators of bullying behavior.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null
  },
  {
    id: 'flag_006',
    postId: 'announcement_pqr678',
    postType: 'announcement',
    content: 'Important: All students must pay Rs. 5000 to my personal account for lab equipment. This is mandatory and must be done by tomorrow.',
    authorName: 'Dr. Kumar (Unverified)',
    authorRole: 'teacher',
    authorId: 'user_678',
    classroom: 'Civil - Section B',
    department: 'Civil',
    riskCategory: 'policy_violation',
    riskSeverity: 'high',
    confidenceScore: 0.92,
    flaggedAt: '2026-01-07T14:00:00Z',
    interactions: { likes: 1, comments: 12 },
    aiReasoning: 'Suspicious financial request to personal account. Potential impersonation or policy violation. Requires immediate verification.',
    status: 'removed',
    reviewedBy: 'Admin User',
    reviewedAt: '2026-01-07T15:30:00Z'
  }
];

// Moderation action log
const mockModerationLog = [
  { id: 1, action: 'removed', postId: 'announcement_pqr678', adminName: 'Admin User', timestamp: '2026-01-07T15:30:00Z', reason: 'Fraudulent financial request' },
  { id: 2, action: 'approved', postId: 'moment_xyz999', adminName: 'Admin User', timestamp: '2026-01-07T12:00:00Z', reason: 'False positive - legitimate complaint' },
  { id: 3, action: 'reviewed', postId: 'moment_jkl012', adminName: 'Admin User', timestamp: '2026-01-08T06:00:00Z', reason: 'Marked for monitoring' },
];

// Mock AI-Aggregated Issues Data
const mockAggregatedIssues = [
  {
    id: 'agg_001',
    title: 'WiFi Connectivity Issues Across Campus',
    aiSummary: 'Multiple students reporting intermittent WiFi disconnections and slow speeds, primarily in hostels A-Block and B-Block, and the main library. Peak issues occur during evening hours (6-10 PM).',
    severity: 'critical',
    relatedCount: 23,
    totalComments: 67,
    totalAffected: 156,
    sentiment: -0.72,
    category: 'Infrastructure',
    locations: ['A-Block Hostel', 'B-Block Hostel', 'Main Library'],
    status: 'in_progress',
    lastActivity: '2026-01-08T10:30:00Z',
    createdAt: '2026-01-02T08:00:00Z',
    trend: 'increasing',
    relatedIssues: [
      { id: 'issue_101', title: 'WiFi not working in A-Block 3rd floor', status: 'reported', affected: 12 },
      { id: 'issue_102', title: 'Internet speed very slow in library', status: 'acknowledged', affected: 45 },
      { id: 'issue_103', title: 'WiFi keeps disconnecting in B-Block', status: 'in_progress', affected: 28 },
    ]
  },
  {
    id: 'agg_002',
    title: 'Hostel Water Supply Disruptions',
    aiSummary: 'Recurring water supply issues reported in C-Block and D-Block hostels. Students experiencing no water during morning hours (6-9 AM) and inconsistent pressure throughout the day.',
    severity: 'high',
    relatedCount: 15,
    totalComments: 42,
    totalAffected: 89,
    sentiment: -0.65,
    category: 'Facilities',
    locations: ['C-Block Hostel', 'D-Block Hostel'],
    status: 'acknowledged',
    lastActivity: '2026-01-08T08:15:00Z',
    createdAt: '2026-01-04T06:30:00Z',
    trend: 'stable',
    relatedIssues: [
      { id: 'issue_201', title: 'No water in C-Block morning', status: 'reported', affected: 34 },
      { id: 'issue_202', title: 'Water pressure too low D-Block', status: 'acknowledged', affected: 22 },
    ]
  },
  {
    id: 'agg_003',
    title: 'Classroom AC/Ventilation Problems',
    aiSummary: 'Air conditioning units malfunctioning in multiple classrooms in the CSE and ECE blocks. Students reporting uncomfortable temperatures affecting concentration during lectures.',
    severity: 'medium',
    relatedCount: 8,
    totalComments: 19,
    totalAffected: 120,
    sentiment: -0.45,
    category: 'Infrastructure',
    locations: ['CSE Block', 'ECE Block'],
    status: 'reported',
    lastActivity: '2026-01-07T14:20:00Z',
    createdAt: '2026-01-05T11:00:00Z',
    trend: 'stable',
    relatedIssues: [
      { id: 'issue_301', title: 'AC not working in CSE Lab 3', status: 'reported', affected: 40 },
      { id: 'issue_302', title: 'No ventilation ECE classroom 201', status: 'reported', affected: 35 },
    ]
  },
  {
    id: 'agg_004',
    title: 'Canteen Food Quality Concerns',
    aiSummary: 'Students raising concerns about food freshness and hygiene in the main canteen. Reports of stale food items and cleanliness issues during lunch hours.',
    severity: 'high',
    relatedCount: 12,
    totalComments: 38,
    totalAffected: 67,
    sentiment: -0.58,
    category: 'Food & Hygiene',
    locations: ['Main Canteen', 'Food Court'],
    status: 'in_progress',
    lastActivity: '2026-01-08T12:45:00Z',
    createdAt: '2026-01-03T13:00:00Z',
    trend: 'decreasing',
    relatedIssues: [
      { id: 'issue_401', title: 'Stale food served in canteen', status: 'in_progress', affected: 25 },
      { id: 'issue_402', title: 'Unhygienic conditions in food court', status: 'acknowledged', affected: 18 },
    ]
  },
  {
    id: 'agg_005',
    title: 'Parking Space Shortage',
    aiSummary: 'Insufficient parking spaces for two-wheelers near academic blocks. Students arriving after 9 AM unable to find parking, leading to unauthorized parking in restricted areas.',
    severity: 'low',
    relatedCount: 6,
    totalComments: 14,
    totalAffected: 45,
    sentiment: -0.32,
    category: 'Transportation',
    locations: ['Main Gate', 'Academic Block Parking'],
    status: 'reported',
    lastActivity: '2026-01-06T09:30:00Z',
    createdAt: '2026-01-06T08:00:00Z',
    trend: 'stable',
    relatedIssues: [
      { id: 'issue_501', title: 'No parking space near CSE block', status: 'reported', affected: 30 },
    ]
  },
  {
    id: 'agg_006',
    title: 'Library Resource Availability',
    aiSummary: 'Students unable to access required textbooks and reference materials. Multiple copies of popular books always checked out, digital resources access issues reported.',
    severity: 'medium',
    relatedCount: 9,
    totalComments: 22,
    totalAffected: 78,
    sentiment: -0.41,
    category: 'Academic',
    locations: ['Central Library'],
    status: 'acknowledged',
    lastActivity: '2026-01-07T16:00:00Z',
    createdAt: '2026-01-04T10:00:00Z',
    trend: 'increasing',
    relatedIssues: [
      { id: 'issue_601', title: 'DBMS textbook not available', status: 'acknowledged', affected: 35 },
      { id: 'issue_602', title: 'E-library access not working', status: 'reported', affected: 28 },
    ]
  }
];

function AdminDashboard() {
  const { user } = useOutletContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0, totalIssues: 0, pendingIssues: 0, resolvedIssues: 0,
    totalMoments: 0, totalOpportunities: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [aggregatedIssues, setAggregatedIssues] = useState(mockAggregatedIssues);
  const [loading, setLoading] = useState(true);
  const [aiProcessing, setAiProcessing] = useState(false);
  
  // Moderation state
  const [flaggedPosts, setFlaggedPosts] = useState(mockFlaggedPosts);
  const [moderationLog, setModerationLog] = useState(mockModerationLog);
  const [modRiskFilter, setModRiskFilter] = useState('all');
  const [modSeverityFilter, setModSeverityFilter] = useState('all');
  const [modStatusFilter, setModStatusFilter] = useState('pending');
  const [modSortBy, setModSortBy] = useState('severity');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Filters for aggregated issues
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('severity');
  const [expandedIssue, setExpandedIssue] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [issues, moments, opportunities] = await Promise.all([
        apiGet('/api/issues'),
        apiGet('/api/moments'),
        apiGet('/api/opportunities'),
      ]);
      setStats({
        totalUsers: 150,
        totalIssues: issues.length,
        pendingIssues: issues.filter(i => i.status === 'reported' || i.status === 'acknowledged').length,
        resolvedIssues: issues.filter(i => i.status === 'resolved').length,
        totalMoments: moments.length,
        totalOpportunities: opportunities.length,
      });
      setRecentIssues(issues.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssueStatus = async (issueId, newStatus, message) => {
    try {
      await apiPut(`/api/issues/${issueId}/status`, {
        status: newStatus,
        message: message || `Status updated to ${newStatus}`,
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue status');
    }
  };

  const simulateAiProcessing = () => {
    setAiProcessing(true);
    setTimeout(() => {
      setAiProcessing(false);
      alert('AI analysis complete! Issue clusters updated.');
    }, 2000);
  };

  // Moderation handlers
  const handleApprovePost = (postId) => {
    setFlaggedPosts(flaggedPosts.map(p => 
      p.id === postId ? { ...p, status: 'approved', reviewedBy: user?.name, reviewedAt: new Date().toISOString() } : p
    ));
    setModerationLog([
      { id: Date.now(), action: 'approved', postId, adminName: user?.name, timestamp: new Date().toISOString(), reason: 'Approved by admin' },
      ...moderationLog
    ]);
    setSelectedPost(null);
  };

  const handleRemovePost = (postId) => {
    if (window.confirm('Are you sure you want to remove this post? This action will be logged.')) {
      setFlaggedPosts(flaggedPosts.map(p => 
        p.id === postId ? { ...p, status: 'removed', reviewedBy: user?.name, reviewedAt: new Date().toISOString() } : p
      ));
      setModerationLog([
        { id: Date.now(), action: 'removed', postId, adminName: user?.name, timestamp: new Date().toISOString(), reason: 'Removed by admin' },
        ...moderationLog
      ]);
      setSelectedPost(null);
    }
  };

  const handleMarkReviewed = (postId) => {
    setFlaggedPosts(flaggedPosts.map(p => 
      p.id === postId ? { ...p, status: 'reviewed', reviewedBy: user?.name, reviewedAt: new Date().toISOString() } : p
    ));
    setModerationLog([
      { id: Date.now(), action: 'reviewed', postId, adminName: user?.name, timestamp: new Date().toISOString(), reason: 'Marked as reviewed' },
      ...moderationLog
    ]);
    setSelectedPost(null);
  };

  const getRiskCategoryConfig = (category) => {
    const configs = {
      harassment: { bg: 'bg-red-100', text: 'text-red-700', label: 'Harassment', icon: '🚫' },
      hate_speech: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Hate Speech', icon: '⛔' },
      self_harm: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Self-Harm', icon: '💔' },
      bullying: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bullying', icon: '😢' },
      misinformation: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Misinformation', icon: '⚠️' },
      policy_violation: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Policy Violation', icon: '📋' },
    };
    return configs[category] || { bg: 'bg-gray-100', text: 'text-gray-700', label: category, icon: '❓' };
  };

  const getModStatusConfig = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      removed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Removed' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reviewed' },
    };
    return configs[status] || configs.pending;
  };

  // Filter flagged posts
  const filteredFlaggedPosts = flaggedPosts
    .filter(p => modRiskFilter === 'all' || p.riskCategory === modRiskFilter)
    .filter(p => modSeverityFilter === 'all' || p.riskSeverity === modSeverityFilter)
    .filter(p => modStatusFilter === 'all' || p.status === modStatusFilter)
    .sort((a, b) => {
      if (modSortBy === 'severity') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.riskSeverity] - order[b.riskSeverity];
      }
      if (modSortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
      if (modSortBy === 'recent') return new Date(b.flaggedAt) - new Date(a.flaggedAt);
      return 0;
    });

  const riskCategories = [...new Set(flaggedPosts.map(p => p.riskCategory))];

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle, label: 'CRITICAL' },
      high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, label: 'HIGH' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Info, label: 'MEDIUM' },
      low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: Info, label: 'LOW' },
    };
    return configs[severity] || configs.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-slate-100 text-slate-700 border-slate-200',
      acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return colors[status] || colors.reported;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp size={14} className="text-red-500" />;
    if (trend === 'decreasing') return <TrendingUp size={14} className="text-green-500 rotate-180" />;
    return <span className="w-3 h-0.5 bg-gray-400 inline-block" />;
  };

  // Filter and sort aggregated issues
  const filteredAggregatedIssues = aggregatedIssues
    .filter(issue => severityFilter === 'all' || issue.severity === severityFilter)
    .filter(issue => categoryFilter === 'all' || issue.category === categoryFilter)
    .filter(issue => statusFilter === 'all' || issue.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.severity] - order[b.severity];
      }
      if (sortBy === 'affected') return b.totalAffected - a.totalAffected;
      if (sortBy === 'recent') return new Date(b.lastActivity) - new Date(a.lastActivity);
      if (sortBy === 'complaints') return b.relatedCount - a.relatedCount;
      return 0;
    });

  const categories = [...new Set(aggregatedIssues.map(i => i.category))];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need admin privileges to access this page.</p>
          <Link to="/community" className="text-cit-gold hover:underline">Go to Community</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cit-navy"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-cit-navy mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage campus issues and monitor platform activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'overview' 
                ? 'border-cit-navy text-cit-navy' 
                : 'border-transparent text-gray-500 hover:text-cit-navy'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ai-insights' 
                ? 'border-cit-navy text-cit-navy' 
                : 'border-transparent text-gray-500 hover:text-cit-navy'
            }`}
          >
            <Brain size={16} />
            AI Issue Insights
            <span className="px-2 py-0.5 bg-cit-gold text-cit-navy text-xs font-bold rounded">NEW</span>
          </button>
          <button
            onClick={() => setActiveTab('all-issues')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'all-issues' 
                ? 'border-cit-navy text-cit-navy' 
                : 'border-transparent text-gray-500 hover:text-cit-navy'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'moderation' 
                ? 'border-cit-navy text-cit-navy' 
                : 'border-transparent text-gray-500 hover:text-cit-navy'
            }`}
          >
            <Shield size={16} />
            AI Moderation
            {flaggedPosts.filter(p => p.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {flaggedPosts.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="text-orange-600" size={24} />
                  </div>
                  <span className="text-sm font-medium text-orange-600">{stats.pendingIssues} pending</span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalIssues}</h3>
                <p className="text-sm text-gray-500">Total Issues</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.resolvedIssues}</h3>
                <p className="text-sm text-gray-500">Resolved Issues</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageCircle className="text-purple-600" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalMoments}</h3>
                <p className="text-sm text-gray-500">Community Moments</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Briefcase className="text-indigo-600" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalOpportunities}</h3>
                <p className="text-sm text-gray-500">Opportunities Posted</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-cit-gold/20 flex items-center justify-center">
                    <Brain className="text-cit-navy" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{aggregatedIssues.length}</h3>
                <p className="text-sm text-gray-500">AI Issue Clusters</p>
              </div>
            </div>

            {/* AI Insights Summary */}
            <div className="bg-gradient-to-r from-cit-navy to-blue-800 rounded-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain size={24} />
                  <h2 className="text-xl font-semibold">AI Issue Analysis Summary</h2>
                </div>
                <button
                  onClick={simulateAiProcessing}
                  disabled={aiProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={aiProcessing ? 'animate-spin' : ''} />
                  {aiProcessing ? 'Processing...' : 'Run Analysis'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl font-bold text-red-300">{aggregatedIssues.filter(i => i.severity === 'critical').length}</p>
                  <p className="text-sm text-white/70">Critical Issues</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl font-bold text-orange-300">{aggregatedIssues.filter(i => i.severity === 'high').length}</p>
                  <p className="text-sm text-white/70">High Priority</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl font-bold text-cit-gold">{aggregatedIssues.reduce((sum, i) => sum + i.relatedCount, 0)}</p>
                  <p className="text-sm text-white/70">Total Complaints</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-3xl font-bold text-green-300">{aggregatedIssues.reduce((sum, i) => sum + i.totalAffected, 0)}</p>
                  <p className="text-sm text-white/70">Students Affected</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Filters:</span>
                </div>
                
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                  >
                    <option value="severity">Severity</option>
                    <option value="affected">Most Affected</option>
                    <option value="complaints">Most Complaints</option>
                    <option value="recent">Recent Activity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Aggregated Issues List */}
            <div className="space-y-4">
              {filteredAggregatedIssues.map((issue) => {
                const severityConfig = getSeverityConfig(issue.severity);
                const SeverityIcon = severityConfig.icon;
                const isExpanded = expandedIssue === issue.id;

                return (
                  <div key={issue.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Main Card */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${severityConfig.bg} ${severityConfig.text} border ${severityConfig.border}`}>
                              <SeverityIcon size={12} />
                              {severityConfig.label}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                              {issue.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              {getTrendIcon(issue.trend)}
                              {issue.trend}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-cit-navy mb-2">{issue.title}</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Brain size={14} className="text-cit-gold" />
                            <span className="text-xs text-cit-gold font-medium">AI Summary</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{issue.aiSummary}</p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Layers size={14} />
                              {issue.relatedCount} complaints
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              {issue.totalComments} comments
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {issue.totalAffected} affected
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDistanceToNow(new Date(issue.lastActivity), { addSuffix: true })}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {issue.locations.map((loc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                📍 {loc}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-cit-navy/10 text-cit-navy text-xs rounded font-medium">
                              {issue.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-cit-navy text-white rounded-lg text-sm font-medium hover:bg-cit-navy/90 transition-colors"
                          >
                            <Eye size={16} />
                            {isExpanded ? 'Hide' : 'View'} Details
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <h4 className="font-semibold text-cit-navy mb-4 flex items-center gap-2">
                          <Layers size={16} />
                          Related Individual Complaints ({issue.relatedIssues.length})
                        </h4>
                        <div className="space-y-3">
                          {issue.relatedIssues.map((related) => (
                            <div key={related.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800">{related.title}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(related.status)}`}>
                                    {related.status.replace('_', ' ')}
                                  </span>
                                  <span>{related.affected} affected</span>
                                </div>
                              </div>
                              <Link
                                to={`/issues/${related.id}`}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                View →
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Sentiment Analysis */}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            Sentiment Analysis
                          </h5>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${issue.sentiment < -0.5 ? 'bg-red-500' : issue.sentiment < -0.25 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${Math.abs(issue.sentiment) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${issue.sentiment < -0.5 ? 'text-red-600' : issue.sentiment < -0.25 ? 'text-orange-600' : 'text-yellow-600'}`}>
                              {issue.sentiment < -0.5 ? 'Very Negative' : issue.sentiment < -0.25 ? 'Negative' : 'Slightly Negative'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredAggregatedIssues.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No aggregated issues match your filters</p>
              </div>
            )}
          </div>
        )}

        {/* All Issues Tab */}
        {activeTab === 'all-issues' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-heading font-semibold mb-6">All Individual Issues</h2>
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <div key={issue.issue_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Link to={`/issues/${issue.issue_id}`} className="font-semibold hover:text-cit-gold transition-colors">
                          {issue.title}
                        </Link>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{issue.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📍 {issue.location}</span>
                        <span>👥 {issue.affected_count} affected</span>
                        <span>🏷️ {issue.category}</span>
                        <span>⏰ {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {issue.status === 'reported' && (
                        <button onClick={() => handleUpdateIssueStatus(issue.issue_id, 'acknowledged', 'Issue acknowledged')} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">Acknowledge</button>
                      )}
                      {issue.status === 'acknowledged' && (
                        <button onClick={() => handleUpdateIssueStatus(issue.issue_id, 'in_progress', 'Working on it')} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">Start Work</button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button onClick={() => handleUpdateIssueStatus(issue.issue_id, 'resolved', 'Resolved')} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">Resolve</button>
                      )}
                      <Link to={`/issues/${issue.issue_id}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors text-center">View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Moderation Tab */}
        {activeTab === 'moderation' && (
          <div>
            {/* Moderation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{flaggedPosts.filter(p => p.status === 'pending').length}</p>
                    <p className="text-xs text-gray-500">Pending Review</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{flaggedPosts.filter(p => p.riskSeverity === 'critical').length}</p>
                    <p className="text-xs text-gray-500">Critical Flags</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{flaggedPosts.filter(p => p.status === 'approved').length}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Trash2 className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{flaggedPosts.filter(p => p.status === 'removed').length}</p>
                    <p className="text-xs text-gray-500">Removed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Filters:</span>
                </div>
                
                <select
                  value={modRiskFilter}
                  onChange={(e) => setModRiskFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Risk Types</option>
                  {riskCategories.map(cat => (
                    <option key={cat} value={cat}>{getRiskCategoryConfig(cat).label}</option>
                  ))}
                </select>

                <select
                  value={modSeverityFilter}
                  onChange={(e) => setModSeverityFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={modStatusFilter}
                  onChange={(e) => setModStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="removed">Removed</option>
                  <option value="reviewed">Reviewed</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort:</span>
                  <select
                    value={modSortBy}
                    onChange={(e) => setModSortBy(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cit-gold"
                  >
                    <option value="severity">Severity</option>
                    <option value="confidence">Confidence</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Flagged Posts List */}
            <div className="space-y-4">
              {filteredFlaggedPosts.map((post) => {
                const riskConfig = getRiskCategoryConfig(post.riskCategory);
                const severityConfig = getSeverityConfig(post.riskSeverity);
                const statusConfig = getModStatusConfig(post.status);
                const SeverityIcon = severityConfig.icon;

                return (
                  <div key={post.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Risk Indicator */}
                        <div className={`w-12 h-12 rounded-lg ${severityConfig.bg} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-2xl">{riskConfig.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${severityConfig.bg} ${severityConfig.text}`}>
                              <SeverityIcon size={12} />
                              {severityConfig.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskConfig.bg} ${riskConfig.text}`}>
                              {riskConfig.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              {Math.round(post.confidenceScore * 100)}% confidence
                            </span>
                          </div>

                          {/* Content Preview */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4 border-l-4 border-gray-300">
                            <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {post.authorName}
                              <span className={`ml-1 px-1.5 py-0.5 rounded ${post.authorRole === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {post.authorRole}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {post.postType}
                            </span>
                            <span>📚 {post.classroom}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDistanceToNow(new Date(post.flaggedAt), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-2">
                              <ThumbsUp size={12} /> {post.interactions.likes}
                              <MessageCircle size={12} /> {post.interactions.comments}
                            </span>
                          </div>

                          {/* AI Reasoning */}
                          <div className="flex items-start gap-2 p-3 bg-cit-navy/5 rounded-lg">
                            <Brain size={14} className="text-cit-navy mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-cit-navy mb-1">AI Analysis</p>
                              <p className="text-xs text-gray-600">{post.aiReasoning}</p>
                            </div>
                          </div>

                          {/* Review Info */}
                          {post.reviewedBy && (
                            <div className="mt-3 text-xs text-gray-500">
                              Reviewed by {post.reviewedBy} • {formatDistanceToNow(new Date(post.reviewedAt), { addSuffix: true })}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {post.status === 'pending' && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApprovePost(post.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRemovePost(post.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                            <button
                              onClick={() => handleMarkReviewed(post.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              <Eye size={16} />
                              Mark Reviewed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFlaggedPosts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No flagged posts match your filters</p>
              </div>
            )}

            {/* Moderation Log */}
            <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-cit-navy flex items-center gap-2">
                  <FileText size={18} />
                  Recent Moderation Actions
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {moderationLog.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        log.action === 'approved' ? 'bg-green-100' : 
                        log.action === 'removed' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {log.action === 'approved' ? <CheckCircle2 size={16} className="text-green-600" /> :
                         log.action === 'removed' ? <Trash2 size={16} className="text-red-600" /> :
                         <Eye size={16} className="text-blue-600" />}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Post <span className="font-mono text-xs bg-gray-100 px-1 rounded">{log.postId}</span> {log.action}
                        </p>
                        <p className="text-xs text-gray-500">{log.reason}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>{log.adminName}</p>
                      <p>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
