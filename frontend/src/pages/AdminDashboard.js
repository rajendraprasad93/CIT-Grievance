import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Users, 
  AlertTriangle, 
  Briefcase, 
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { apiGet, apiPut } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

function AdminDashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalMoments: 0,
    totalOpportunities: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

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
        totalUsers: 150, // Mock for now
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

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-slate-100 text-slate-700 border-slate-200',
      acknowledged: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    return colors[status] || colors.reported;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle size={64} className="text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Link to="/community" className="text-accent hover:underline">
            Go to Community
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage campus issues and monitor platform activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-muted-foreground">Active Users</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
              <span className="text-sm font-medium text-orange-600">{stats.pendingIssues} pending</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalIssues}</h3>
            <p className="text-sm text-muted-foreground">Total Issues</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <span className="text-sm font-medium text-green-600">
                {stats.totalIssues > 0 ? Math.round((stats.resolvedIssues / stats.totalIssues) * 100) : 0}%
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.resolvedIssues}</h3>
            <p className="text-sm text-muted-foreground">Resolved Issues</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageCircle className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalMoments}</h3>
            <p className="text-sm text-muted-foreground">Community Moments</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Briefcase className="text-indigo-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalOpportunities}</h3>
            <p className="text-sm text-muted-foreground">Opportunities Posted</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">
              {stats.totalIssues > 0 ? Math.round((stats.pendingIssues / stats.totalIssues) * 100) : 0}%
            </h3>
            <p className="text-sm text-muted-foreground">Response Rate</p>
          </div>
        </div>

        {/* Recent Issues Table */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-heading font-semibold mb-6">Recent Issues</h2>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div
                key={issue.issue_id}
                className="border border-border rounded-lg p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        to={`/issues/${issue.issue_id}`}
                        className="font-semibold hover:text-accent transition-colors"
                      >
                        {issue.title}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📍 {issue.location}</span>
                      <span>👥 {issue.affected_count} affected</span>
                      <span>🏷️ {issue.category}</span>
                      <span>⏰ {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {issue.status === 'reported' && (
                      <button
                        onClick={() => handleUpdateIssueStatus(issue.issue_id, 'acknowledged', 'Issue acknowledged by admin team')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    {issue.status === 'acknowledged' && (
                      <button
                        onClick={() => handleUpdateIssueStatus(issue.issue_id, 'in_progress', 'Team is working on this issue')}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
                      >
                        Start Work
                      </button>
                    )}
                    {issue.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateIssueStatus(issue.issue_id, 'resolved', 'Issue has been resolved')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <Link
                      to={`/issues/${issue.issue_id}`}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
