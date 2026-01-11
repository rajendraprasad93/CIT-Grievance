import { useState } from 'react';
import { Search, Users, BookOpen, MapPin, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

function FindPartners() {
  const [filters, setFilters] = useState({
    course: '',
    skill: '',
    hostel: '',
    availability: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const partners = [
    {
      id: 1,
      name: 'Priya Sharma',
      department: 'CSE',
      year: 3,
      hostel: 'A-Block',
      skills: ['Python', 'Machine Learning', 'DBMS'],
      canHelp: ['Data Structures', 'Algorithms'],
      needsHelp: ['Operating Systems'],
      availability: 'Weekday evenings',
      matchScore: 95,
    },
    {
      id: 2,
      name: 'Rohit Kumar',
      department: 'CSE',
      year: 3,
      hostel: 'B-Block',
      skills: ['Java', 'Web Development', 'React'],
      canHelp: ['Frontend Development', 'UI/UX'],
      needsHelp: ['Backend APIs'],
      availability: 'Weekends',
      matchScore: 88,
    },
    {
      id: 3,
      name: 'Neha Patel',
      department: 'CSE',
      year: 2,
      hostel: 'A-Block',
      skills: ['C++', 'DSA', 'Competitive Programming'],
      canHelp: ['Problem Solving', 'Coding Practice'],
      needsHelp: ['System Design'],
      availability: 'Flexible',
      matchScore: 82,
    },
  ];

  const filteredPartners = partners.filter((partner) => {
    if (filters.course && partner.department !== filters.course) return false;
    if (filters.hostel && partner.hostel !== filters.hostel) return false;
    if (searchQuery && !partner.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !partner.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm font-medium mb-1">Connect 🤝</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Find <span className="text-amber-600">Study Partners</span>
          </h1>
          <p className="text-gray-500 text-sm">Connect with peers who can help you learn and grow</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-5">
                <Filter size={18} className="text-amber-500" />
                <h2 className="font-bold text-gray-900">Filters</h2>
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">SEARCH</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name or skill..."
                      className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">DEPARTMENT</label>
                  <select
                    value={filters.course}
                    onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Departments</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                {/* Hostel */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">HOSTEL</label>
                  <select
                    value={filters.hostel}
                    onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Hostels</option>
                    <option value="A-Block">A-Block</option>
                    <option value="B-Block">B-Block</option>
                    <option value="C-Block">C-Block</option>
                    <option value="D-Block">D-Block</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">AVAILABILITY</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  >
                    <option value="">Any time</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="weekend">Weekends</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(filters.course || filters.hostel || filters.availability || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilters({ course: '', skill: '', hostel: '', availability: '' });
                      setSearchQuery('');
                    }}
                    className="w-full h-10 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium text-sm transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Partners List */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">Found {filteredPartners.length} potential study partners</p>
              <select className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>Best Match</option>
                <option>Nearest</option>
                <option>Most Active</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {partner.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">{partner.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{partner.department} • Year {partner.year}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {partner.hostel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">
                            {partner.matchScore}% Match
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">SKILLS</p>
                        <div className="flex flex-wrap gap-2">
                          {partner.skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Can Help / Needs Help */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                            <BookOpen size={12} />CAN HELP WITH
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {partner.canHelp.map((topic, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                            <Users size={12} />NEEDS HELP WITH
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {partner.needsHelp.map((topic, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>Available: {partner.availability}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          to={`/profile/${partner.id}`}
                          className="flex-1 h-10 px-4 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-semibold transition-all flex items-center justify-center text-sm"
                        >
                          View Profile
                        </Link>
                        <button className="flex-1 h-10 px-4 rounded-lg border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all flex items-center justify-center text-sm">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPartners.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Users size={28} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No partners found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters to find more study partners</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindPartners;
