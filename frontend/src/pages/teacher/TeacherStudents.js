import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, User, Mail, Phone, MoreVertical } from 'lucide-react';

// Mock student data
const mockStudents = [
  { id: 1, name: 'Priya Sharma', rollNo: 'CSE2023001', email: 'priya.s@cit.edu', status: 'active', attendance: 92 },
  { id: 2, name: 'Rohit Kumar', rollNo: 'CSE2023002', email: 'rohit.k@cit.edu', status: 'active', attendance: 88 },
  { id: 3, name: 'Ananya Reddy', rollNo: 'CSE2023003', email: 'ananya.r@cit.edu', status: 'active', attendance: 95 },
  { id: 4, name: 'Vikram Singh', rollNo: 'CSE2023004', email: 'vikram.s@cit.edu', status: 'inactive', attendance: 72 },
  { id: 5, name: 'Sneha Patel', rollNo: 'CSE2023005', email: 'sneha.p@cit.edu', status: 'active', attendance: 90 },
  { id: 6, name: 'Arjun Nair', rollNo: 'CSE2023006', email: 'arjun.n@cit.edu', status: 'active', attendance: 85 },
  { id: 7, name: 'Kavya Menon', rollNo: 'CSE2023007', email: 'kavya.m@cit.edu', status: 'active', attendance: 91 },
  { id: 8, name: 'Rahul Verma', rollNo: 'CSE2023008', email: 'rahul.v@cit.edu', status: 'active', attendance: 87 },
  { id: 9, name: 'Divya Krishnan', rollNo: 'CSE2023009', email: 'divya.k@cit.edu', status: 'inactive', attendance: 68 },
  { id: 10, name: 'Aditya Rao', rollNo: 'CSE2023010', email: 'aditya.r@cit.edu', status: 'active', attendance: 93 },
];

function TeacherStudents() {
  const { user } = useOutletContext();
  const [students, setStudents] = useState(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-cit-navy text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">
            My Students
          </h1>
          <p className="text-white/80">
            CSE - Section A • {students.length} Students
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cit-navy/10 flex items-center justify-center">
                          <span className="text-cit-navy font-semibold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-mono text-sm">{student.rollNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{student.email}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${getAttendanceColor(student.attendance)}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No students found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active: {students.filter(s => s.status === 'active').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Inactive: {students.filter(s => s.status === 'inactive').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherStudents;
