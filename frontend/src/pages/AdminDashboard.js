import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Users, AlertTriangle, Briefcase, MessageCircle, TrendingUp, CheckCircle, 
  Clock, XCircle, Brain, Filter, ChevronDown, ChevronUp, Layers, 
  BarChart3, Zap, AlertCircle, Info, Search, RefreshCw, Eye, Shield,
  Trash2, CheckCircle2, Flag, User, FileText, ThumbsUp, ThumbsDown, Plus,
  Building, MapPin, Calendar, Link as LinkIcon, DollarSign, GraduationCap
} from 'lucide-react';
import { apiGet, apiPut, apiPost, apiDelete } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

// Safe date formatting function
const safeFormatDistanceToNow = (dateString) => {
  try {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return 'Recently';
  }
};

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
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [moderationLog, setModerationLog] = useState([]);
  const [modRiskFilter, setModRiskFilter] = useState('all');
  const [modSeverityFilter, setModSeverityFilter] = useState('all');
  const [modStatusFilter, setModStatusFilter] = useState('pending');
  const [modSortBy, setModSortBy] = useState('severity');
  const [selectedPost, setSelectedPost] = useState(null);
  const [moderationStats, setModerationStats] = useState({
    total_flagged: 0,
    pending: 0,
    approved: 0,
    removed: 0,
    reviewed: 0
  });
  
  // Filters for aggregated issues
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('severity');
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Opportunity management state
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
    console.log('AdminDashboard mounted or tab changed to:', activeTab);
    // Always fetch dashboard data when component mounts or tab changes
    fetchDashboardData();
    
    // Additionally fetch moderation data if on moderation tab
    if (activeTab === 'moderation') {
      fetchModerationData();
    }
    
    // Fetch aggregated issues if on AI insights tab
    if (activeTab === 'ai-insights') {
      fetchAggregatedIssues();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [issuesData, moments, opportunities, adminStats] = await Promise.all([
        apiGet('/api/admin/issues'),
        apiGet('/api/moments'),
        apiGet('/api/opportunities'),
        apiGet('/api/admin/stats').catch(() => null), // Fallback if admin stats fail
      ]);
      
      // Extract issues from the admin response
      const issues = issuesData.issues || issuesData;
      
      console.log('Admin Dashboard - Fetched issues:', issues.length, issues);
      console.log('Admin Dashboard - Admin stats:', adminStats);
      
      // Use real data from admin stats API, with fallbacks
      const totalUsers = adminStats?.platform?.total_users || adminStats?.users?.total_users || 0;
      
      setStats({
        totalUsers: totalUsers,
        totalIssues: issues.length,
        pendingIssues: issues.filter(i => i.status === 'reported' || i.status === 'acknowledged' || i.status === 'in_progress').length,
        resolvedIssues: issues.filter(i => i.status === 'resolved').length,
        totalMoments: moments.length,
        totalOpportunities: opportunities.length,
      });
      setRecentIssues(issues.slice(0, 10));
      console.log('Admin Dashboard - Set recentIssues:', issues.slice(0, 10));
      console.log('Admin Dashboard - Stats set:', {
        totalUsers,
        totalIssues: issues.length,
        pendingIssues: issues.filter(i => i.status === 'reported' || i.status === 'acknowledged' || i.status === 'in_progress').length,
        resolvedIssues: issues.filter(i => i.status === 'resolved').length,
        totalMoments: moments.length,
        totalOpportunities: opportunities.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationData = async () => {
    try {
      const [flaggedData, logData, statsData] = await Promise.all([
        apiGet('/api/admin/moderation/flagged?limit=100'),
        apiGet('/api/admin/moderation/log?limit=50'),
        apiGet('/api/admin/moderation/stats'),
      ]);
      
      setFlaggedPosts(flaggedData.flagged_content || []);
      setModerationLog(logData.logs || []);
      setModerationStats(statsData || {
        total_flagged: 0,
        pending: 0,
        approved: 0,
        removed: 0,
        reviewed: 0
      });
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      // Keep using mock data if API fails
      setFlaggedPosts(mockFlaggedPosts);
      setModerationLog(mockModerationLog);
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

  const runAiAnalysis = async () => {
    setAiProcessing(true);
    try {
      console.log('Starting AI analysis...');
      
      // Run the AI analysis using the API utility
      const analysisResult = await apiPost('/api/admin/issues/run-analysis', {});
      console.log('AI Analysis Result:', analysisResult);
      
      // Fetch the updated aggregated issues
      await fetchAggregatedIssues();
      
      // Show detailed analysis results
      if (analysisResult.success && analysisResult.aggregated_issues && analysisResult.aggregated_issues.length > 0) {
        console.log('Analysis successful, showing modal with', analysisResult.aggregated_issues.length, 'clusters');
        setAnalysisResults(analysisResult);
        setShowAnalysisModal(true);
        
        // Also show a brief notification
        alert(`✅ AI Analysis Complete!\n\nFound ${analysisResult.clusters_found} issue clusters from ${analysisResult.total_issues_processed} issues.\n\nClick OK to view detailed results.`);
      } else {
        alert(`AI analysis completed! Found ${analysisResult.clusters_found || 0} issue clusters.`);
      }
    } catch (error) {
      console.error('Error running AI analysis:', error);
      alert(`Failed to run AI analysis: ${error.message}`);
    } finally {
      setAiProcessing(false);
    }
  };

  const showAnalysisResults = (result) => {
    if (!result.success || !result.aggregated_issues || result.aggregated_issues.length === 0) {
      alert(`AI analysis completed! Found ${result.clusters_found || 0} clusters.`);
      return;
    }

    setAnalysisResults(result);
    setShowAnalysisModal(true);
  };

  const fetchAggregatedIssues = async () => {
    try {
      const data = await apiGet('/api/admin/issues/aggregated');
      console.log('Fetched aggregated issues:', data);
      setAggregatedIssues(data.aggregated_issues || []);
    } catch (error) {
      console.error('Error fetching aggregated issues:', error);
      // Keep using mock data as fallback
    }
  };

  // Opportunity handlers
  const handleOpportunitySubmit = async (e) => {
    e.preventDefault();
    setOpportunitySubmitting(true);
    
    try {
      // Validate required fields
      if (!opportunityForm.title || !opportunityForm.description || !opportunityForm.opp_type) {
        alert('Please fill in all required fields (Title, Description, Type)');
        setOpportunitySubmitting(false);
        return;
      }
      
      const response = await apiPost('/api/admin/opportunities', opportunityForm);
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
      
      // Refresh dashboard data
      fetchDashboardData();
      
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

  // Moderation handlers
  const handleApprovePost = async (flagId) => {
    try {
      await apiPost(`/api/admin/moderation/${flagId}/approve`, { reason: 'Approved by admin' });
      // Refresh moderation data
      await fetchModerationData();
      setSelectedPost(null);
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    }
  };

  const handleRemovePost = async (flagId) => {
    if (window.confirm('Are you sure you want to remove this post? This action will be logged.')) {
      try {
        await apiPost(`/api/admin/moderation/${flagId}/remove`, { reason: 'Removed by admin' });
        // Refresh moderation data
        await fetchModerationData();
        setSelectedPost(null);
      } catch (error) {
        console.error('Error removing post:', error);
        alert('Failed to remove post');
      }
    }
  };

  const handleMarkReviewed = async (flagId) => {
    try {
      await apiPost(`/api/admin/moderation/${flagId}/review`, { reason: 'Marked as reviewed' });
      // Refresh moderation data
      await fetchModerationData();
      setSelectedPost(null);
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      alert('Failed to mark as reviewed');
    }
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
    .filter(p => modRiskFilter === 'all' || p.risk_category === modRiskFilter)
    .filter(p => modSeverityFilter === 'all' || p.risk_severity === modSeverityFilter)
    .filter(p => modStatusFilter === 'all' || p.status === modStatusFilter)
    .sort((a, b) => {
      if (modSortBy === 'severity') {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.risk_severity] - order[b.risk_severity];
      }
      if (modSortBy === 'confidence') return b.confidence_score - a.confidence_score;
      if (modSortBy === 'recent') return new Date(b.flagged_at) - new Date(a.flagged_at);
      return 0;
    });

  const riskCategories = [...new Set(flaggedPosts.map(p => p.risk_category))];

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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You need admin privileges to access this page.</p>
          <Link to="/community" className="text-amber-600 hover:underline">Go to Community</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Manage campus issues and monitor platform activity</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'border-amber-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-insights')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ai-insights' 
                ? 'border-amber-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Brain size={16} />
            AI Issue Insights
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">NEW</span>
          </button>
          <button
            onClick={() => setActiveTab('all-issues')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'all-issues' 
                ? 'border-amber-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'moderation' 
                ? 'border-amber-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Users className="text-amber-600" size={24} />
                  </div>
                  <TrendingUp className="text-emerald-600" size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertTriangle className="text-orange-600" size={24} />
                  </div>
                  <span className="text-sm font-medium text-orange-600">{stats.pendingIssues} pending</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalIssues}</h3>
                <p className="text-sm text-gray-500">Total Issues</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <span className="text-sm font-medium text-emerald-600">
                    {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.resolvedIssues}</h3>
                <p className="text-sm text-gray-500">Resolved Issues</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <MessageCircle className="text-blue-600" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalMoments}</h3>
                <p className="text-sm text-gray-500">Community Moments</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Briefcase className="text-amber-600" size={24} />
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
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOpportunities}</h3>
                <p className="text-sm text-gray-500">Opportunities Posted</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Brain className="text-amber-600" size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{aggregatedIssues.length}</h3>
                <p className="text-sm text-gray-500">AI Issue Clusters</p>
              </div>
            </div>

            {/* AI Insights Summary */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Brain size={24} className="text-amber-400" />
                  <h2 className="text-xl font-semibold">AI Issue Analysis Summary</h2>
                </div>
                <button
                  onClick={runAiAnalysis}
                  disabled={aiProcessing}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 text-gray-900"
                  title="Analyze all issues and group similar ones together using AI"
                >
                  <RefreshCw size={16} className={aiProcessing ? 'animate-spin' : ''} />
                  {aiProcessing ? 'Analyzing Issues...' : 'Run AI Analysis'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-3xl font-bold text-red-400">{aggregatedIssues.filter(i => i.severity === 'critical').length}</p>
                  <p className="text-sm text-white/70">Critical Issues</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-3xl font-bold text-orange-400">{aggregatedIssues.filter(i => i.severity === 'high').length}</p>
                  <p className="text-sm text-white/70">High Priority</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-3xl font-bold text-amber-400">{aggregatedIssues.reduce((sum, i) => sum + i.relatedCount, 0)}</p>
                  <p className="text-sm text-white/70">Total Complaints</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-3xl font-bold text-emerald-400">{aggregatedIssues.reduce((sum, i) => sum + i.totalAffected, 0)}</p>
                  <p className="text-sm text-white/70">Students Affected</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div>
            {/* AI Analysis Description */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Issue Clustering</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Our AI analyzes all reported issues and automatically groups similar problems together. 
                    This helps identify patterns, prioritize responses, and allocate resources more effectively.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Keyword Analysis</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Location Grouping</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Category Matching</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">Impact Assessment</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Filters:</span>
                </div>
                
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-severity-1" value="all">All Severity</option>
                  <option key="critical-1" value="critical">Critical</option>
                  <option key="high-1" value="high">High</option>
                  <option key="medium-1" value="medium">Medium</option>
                  <option key="low-1" value="low">Low</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-categories" value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-status-1" value="all">All Status</option>
                  <option key="reported-1" value="reported">Reported</option>
                  <option key="acknowledged-1" value="acknowledged">Acknowledged</option>
                  <option key="in_progress-1" value="in_progress">In Progress</option>
                  <option key="resolved-1" value="resolved">Resolved</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option key="severity-sort" value="severity">Severity</option>
                    <option key="affected-sort" value="affected">Most Affected</option>
                    <option key="complaints-sort" value="complaints">Most Complaints</option>
                    <option key="recent-sort" value="recent">Recent Activity</option>
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
                  <div key={issue.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 transition-all">
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
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Brain size={14} className="text-amber-500" />
                            <span className="text-xs text-amber-600 font-medium">AI Summary</span>
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
                              {safeFormatDistanceToNow(issue.lastActivity)}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {issue.locations.map((loc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                📍 {loc}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                              {issue.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
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
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Layers size={16} />
                          Related Individual Complaints ({issue.relatedIssues.length})
                        </h4>
                        <div className="space-y-3">
                          {issue.relatedIssues.map((related) => (
                            <div key={related.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
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
                        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart3 size={16} />
                            Sentiment Analysis
                          </h5>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${issue.sentiment < -0.5 ? 'bg-red-500' : issue.sentiment < -0.25 ? 'bg-orange-500' : 'bg-amber-500'}`}
                                  style={{ width: `${Math.abs(issue.sentiment) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${issue.sentiment < -0.5 ? 'text-red-600' : issue.sentiment < -0.25 ? 'text-orange-600' : 'text-amber-600'}`}>
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
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Brain size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No aggregated issues match your filters</p>
              </div>
            )}
          </div>
        )}

        {/* All Issues Tab */}
        {activeTab === 'all-issues' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-gray-900">All Individual Issues</h2>
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This shows formal issues reported via the "Report Issue" page. 
                Issue observations posted in Community Feed are tracked separately as moments.
              </p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading issues...</p>
              </div>
            ) : recentIssues.length > 0 ? (
              <div className="space-y-4">
                {recentIssues.map((issue) => (
                  <div key={issue.issue_id} className="border border-gray-200 rounded-xl p-4 hover:border-amber-300 hover:bg-gray-50 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link to={`/issues/${issue.issue_id}`} className="font-semibold text-gray-900 hover:text-amber-600 transition-colors">
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
                          <span>⏰ {safeFormatDistanceToNow(issue.created_at)}</span>
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
                          <button onClick={() => handleUpdateIssueStatus(issue.issue_id, 'resolved', 'Resolved')} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors">Resolve</button>
                        )}
                        <Link to={`/issues/${issue.issue_id}`} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors text-center">View</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">No issues found</p>
                <p className="text-sm text-gray-400">Issues reported by students will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* AI Moderation Tab */}
        {activeTab === 'moderation' && (
          <div>
            {/* Moderation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Clock className="text-amber-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600">{moderationStats.pending || 0}</p>
                    <p className="text-xs text-gray-500">Pending Review</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertCircle className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{flaggedPosts.filter(p => p.risk_severity === 'critical').length}</p>
                    <p className="text-xs text-gray-500">Critical Flags</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{moderationStats.approved || 0}</p>
                    <p className="text-xs text-gray-500">Approved</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Trash2 className="text-gray-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">{moderationStats.removed || 0}</p>
                    <p className="text-xs text-gray-500">Removed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Filters:</span>
                </div>
                
                <select
                  value={modRiskFilter}
                  onChange={(e) => setModRiskFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-risk-types" value="all">All Risk Types</option>
                  {riskCategories.map(cat => (
                    <option key={cat} value={cat}>{getRiskCategoryConfig(cat).label}</option>
                  ))}
                </select>

                <select
                  value={modSeverityFilter}
                  onChange={(e) => setModSeverityFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-severity-2" value="all">All Severity</option>
                  <option key="critical-2" value="critical">Critical</option>
                  <option key="high-2" value="high">High</option>
                  <option key="medium-2" value="medium">Medium</option>
                  <option key="low-2" value="low">Low</option>
                </select>

                <select
                  value={modStatusFilter}
                  onChange={(e) => setModStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option key="all-status-2" value="all">All Status</option>
                  <option key="pending-2" value="pending">Pending</option>
                  <option key="approved-2" value="approved">Approved</option>
                  <option key="removed-2" value="removed">Removed</option>
                  <option key="reviewed-2" value="reviewed">Reviewed</option>
                </select>

                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort:</span>
                  <select
                    value={modSortBy}
                    onChange={(e) => setModSortBy(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option key="severity-sort-2" value="severity">Severity</option>
                    <option key="confidence-sort" value="confidence">Confidence</option>
                    <option key="recent-sort-2" value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Flagged Posts List */}
            <div className="space-y-4">
              {filteredFlaggedPosts.map((post) => {
                const riskConfig = getRiskCategoryConfig(post.risk_category);
                const severityConfig = getSeverityConfig(post.risk_severity);
                const statusConfig = getModStatusConfig(post.status);
                const SeverityIcon = severityConfig.icon;

                return (
                  <div key={post.flag_id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 transition-all">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Risk Indicator */}
                        <div className={`w-12 h-12 rounded-xl ${severityConfig.bg} flex items-center justify-center flex-shrink-0`}>
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
                              {Math.round(post.confidence_score * 100)}% confidence
                            </span>
                          </div>

                          {/* Content Preview */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 border-l-4 border-gray-300">
                            <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <User size={12} />
                              {post.author_name}
                              <span className={`ml-1 px-1.5 py-0.5 rounded ${post.author_role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {post.author_role}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText size={12} />
                              {post.post_type}
                            </span>
                            {post.classroom && <span>📚 {post.classroom}</span>}
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {safeFormatDistanceToNow(post.flagged_at)}
                            </span>
                            <span className="flex items-center gap-2">
                              <ThumbsUp size={12} /> {post.interactions_likes || 0}
                              <MessageCircle size={12} /> {post.interactions_comments || 0}
                            </span>
                          </div>

                          {/* AI Reasoning */}
                          {post.ai_reasoning && (
                            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                              <Brain size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-medium text-amber-700 mb-1">AI Analysis</p>
                                <p className="text-xs text-gray-600">{post.ai_reasoning}</p>
                              </div>
                            </div>
                          )}

                          {/* Review Info */}
                          {post.reviewed_by && (
                            <div className="mt-3 text-xs text-gray-500">
                              Reviewed by {post.reviewed_by} • {safeFormatDistanceToNow(post.reviewed_at)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {post.status === 'pending' && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApprovePost(post.flag_id)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                              <CheckCircle2 size={16} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRemovePost(post.flag_id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                            <button
                              onClick={() => handleMarkReviewed(post.flag_id)}
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
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No flagged posts match your filters</p>
              </div>
            )}

            {/* Moderation Log */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} />
                  Recent Moderation Actions
                </h3>
              </div>
              {moderationLog.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {moderationLog.slice(0, 5).map((log) => (
                    <div key={log.log_id} className="p-4 flex items-center justify-between">
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
                            Post <span className="font-mono text-xs bg-gray-100 px-1 rounded">{log.post_id}</span> {log.action}
                          </p>
                          {log.reason && <p className="text-xs text-gray-500">{log.reason}</p>}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{log.admin_name}</p>
                        <p>{safeFormatDistanceToNow(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No moderation actions yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Analysis Results Modal */}
      {showAnalysisModal && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain size={28} className="text-amber-400" />
                  <div>
                    <h2 className="text-2xl font-bold">AI Analysis Results</h2>
                    <p className="text-gray-300">Completed at {new Date(analysisResults.analysis_time).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const clusters = analysisResults.aggregated_issues;
                const totalIssues = clusters.reduce((sum, cluster) => sum + cluster.relatedCount, 0);
                const totalAffected = clusters.reduce((sum, cluster) => sum + cluster.totalAffected, 0);
                const criticalClusters = clusters.filter(c => c.severity === 'critical');
                const highClusters = clusters.filter(c => c.severity === 'high');
                const pendingClusters = clusters.filter(c => c.status === 'reported' || c.status === 'acknowledged');
                const mostAffected = clusters.reduce((max, cluster) => 
                  cluster.totalAffected > max.totalAffected ? cluster : max
                );

                return (
                  <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-amber-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-amber-600">{analysisResults.clusters_found}</div>
                        <div className="text-sm text-amber-800">Issue Clusters</div>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{totalIssues}</div>
                        <div className="text-sm text-emerald-800">Issues Analyzed</div>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">{totalAffected}</div>
                        <div className="text-sm text-orange-800">Students Affected</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{pendingClusters.length}</div>
                        <div className="text-sm text-blue-800">Need Attention</div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        AI Recommendations
                      </h3>
                      <div className="space-y-2 text-sm">
                        {criticalClusters.length > 0 && (
                          <div className="flex items-center gap-2 text-red-700">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <strong>URGENT:</strong> Address {criticalClusters.length} critical issue cluster(s) immediately
                          </div>
                        )}
                        {highClusters.length > 0 && (
                          <div className="flex items-center gap-2 text-orange-700">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <strong>HIGH PRIORITY:</strong> Focus on {highClusters.length} high-priority cluster(s)
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-amber-700">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          <strong>HIGHEST IMPACT:</strong> "{mostAffected.title}" affects {mostAffected.totalAffected} students
                        </div>
                        {pendingClusters.length > 0 && (
                          <div className="flex items-center gap-2 text-blue-700">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <strong>ACTION NEEDED:</strong> {pendingClusters.length} cluster(s) require immediate attention
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cluster Details */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Layers size={20} />
                        Detailed Cluster Analysis
                      </h3>
                      
                      {clusters.map((cluster, index) => {
                        const severityConfig = getSeverityConfig(cluster.severity);
                        const SeverityIcon = severityConfig.icon;
                        
                        return (
                          <div key={cluster.id} className="border border-gray-200 rounded-xl p-6 bg-white">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-semibold text-gray-800">
                                    {index + 1}. {cluster.title}
                                  </span>
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${severityConfig.bg} ${severityConfig.text}`}>
                                    <SeverityIcon size={12} />
                                    {severityConfig.label}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users size={14} className="text-gray-500" />
                                    <span>{cluster.totalAffected} affected</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-gray-500" />
                                    <span>{cluster.relatedCount} issues</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${getStatusColor(cluster.status).split(' ')[0]}`}></span>
                                    <span>{cluster.status.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">📍</span>
                                    <span>{cluster.locations.join(', ')}</span>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Brain size={16} className="text-amber-500 mt-0.5" />
                                    <span className="text-sm font-medium text-amber-600">AI Analysis</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{cluster.aiSummary}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Related Issues Preview */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h5 className="text-sm font-medium text-gray-600 mb-2">Related Issues ({cluster.relatedIssues.length})</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {cluster.relatedIssues.slice(0, 4).map((issue) => (
                                  <div key={issue.id} className="text-xs bg-gray-50 rounded-lg p-2 flex items-center justify-between">
                                    <span className="truncate">{issue.title}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(issue.status)}`}>
                                      {issue.status}
                                    </span>
                                  </div>
                                ))}
                                {cluster.relatedIssues.length > 4 && (
                                  <div className="text-xs text-gray-500 italic">
                                    +{cluster.relatedIssues.length - 4} more issues...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        💡 Switch to "AI Issue Insights" tab to interact with these clusters
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowAnalysisModal(false);
                            setActiveTab('ai-insights');
                          }}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          View Insights Tab
                        </button>
                        <button
                          onClick={() => setShowAnalysisModal(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
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
                    <p className="text-gray-300">Create a verified opportunity for students</p>
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
                        Opportunities created by admin are automatically marked as verified and will display a verification badge to students.
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

export default AdminDashboard;
