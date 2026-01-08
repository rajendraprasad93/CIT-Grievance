import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, MessageSquare, BarChart3, Bell, Vote, Calendar } from 'lucide-react';

// Mock data for teacher dashboard
const mockTeacherData = {
  classroom: {
    name: 'CSE - Section A',
    department: 'Computer Science',
    year: 3,
    totalStudents: 45,
  },
  recentAnnouncements: [
    { id: 1, title: 'Mid-semester exam schedule released', date: '2026-01-07', views: 38 },
    { id: 2, title: 'Project submission deadline extended', date: '2026-01-05', views: 42 },
    { id: 3, title: 'Guest lecture on AI/ML tomorrow', date: '2026-01-03', views: 35 },
  ],
  activePolls: [
    { id: 1, question: 'Preferred time for extra class?', totalVotes: 32, status: 'active', endsAt: '2026-01-10' },
    { id: 2, question: 'Topic for next workshop', totalVotes: 28, status: 'closed', endsAt: '2026-01-06' },
  ],
  stats: {
    totalAnnouncements: 12,
    totalPolls: 5,
    avgAttendance: 89,
  }
};

function TeacherDashboard() {
  const { user } = useOutletContext();
  const [dashboardData, setDashboardData] = useState(mockTeacherData);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-white/80">
            Welcome back, {user?.name || 'Teacher'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile & Classroom Info */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Teacher Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-cit-navy text-white flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'T'}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg text-cit-navy">{user?.name || 'Teacher Name'}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-cit-gold/20 text-cit-navy text-xs font-medium rounded">
                  Teacher
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Department:</span> {dashboardData.classroom.department}
              </p>
            </div>
          </div>

          {/* Classroom Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cit-navy/10 flex items-center justify-center">
                <Users className="text-cit-navy" size={20} />
              </div>
              <h3 className="font-semibold text-cit-navy">Assigned Classroom</h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-cit-navy">{dashboardData.classroom.name}</p>
              <p className="text-sm text-gray-600">Year {dashboardData.classroom.year}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-3xl font-bold text-cit-gold">{dashboardData.classroom.totalStudents}</span>
                <span className="text-sm text-gray-500">Students</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-cit-navy mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Announcements</span>
                </div>
                <span className="font-semibold text-cit-navy">{dashboardData.stats.totalAnnouncements}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Vote size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Polls Created</span>
                </div>
                <span className="font-semibold text-cit-navy">{dashboardData.stats.totalPolls}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Avg Attendance</span>
                </div>
                <span className="font-semibold text-green-600">{dashboardData.stats.avgAttendance}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-cit-navy flex items-center gap-2">
                <Bell size={18} />
                Recent Announcements
              </h3>
              <a href="/teacher/forum" className="text-sm text-cit-gold hover:underline">View All</a>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-800 mb-1">{announcement.title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{announcement.date}</span>
                    <span>{announcement.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Polls */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-cit-navy flex items-center gap-2">
                <Vote size={18} />
                Polls
              </h3>
              <a href="/teacher/forum" className="text-sm text-cit-gold hover:underline">Manage</a>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData.activePolls.map((poll) => (
                <div key={poll.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-800 mb-1">{poll.question}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      poll.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {poll.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{poll.totalVotes} votes</span>
                    <span>Ends: {poll.endsAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
