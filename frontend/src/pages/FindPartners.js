import { useState } from 'react';
import { Search, Users, BookOpen, MapPin, Clock, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * FindPartners Page - Smart Matching for Study Partners
 * Tier 2: Peer Discovery & Matching
 */
function FindPartners() {
  const [filters, setFilters] = useState({
    course: '',
    skill: '',
    hostel: '',
    availability: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 font-heading font-bold mb-2">
            Find Study Partners
          </h1>
          <p className="text-body-regular text-muted-foreground">
            Connect with peers who can help you learn and grow 🤝
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-primary" />
                <h2 className="text-heading-3 font-heading font-bold">Filters</h2>
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Search</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name or skill..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Department</label>
                  <select
                    value={filters.course}
                    onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
                  <label className="block text-sm font-semibold mb-2">Hostel</label>
                  <select
                    value={filters.hostel}
                    onChange={(e) => setFilters({ ...filters, hostel: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
                  <label className="block text-sm font-semibold mb-2">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full h-10 px-4 rounded-xl border-2 border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
                    className="w-full h-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium text-sm transition-colors"
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
              <p className="text-sm text-muted-foreground">
                Found {filteredPartners.length} potential study partners
              </p>
              <select className="h-9 px-3 rounded-lg border-2 border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Best Match</option>
                <option>Nearest</option>
                <option>Most Active</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl border-2 border-border p-6 hover:shadow-lg hover:border-primary/30 transition-all animate-slide-in"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-2xl ring-2 ring-primary/20 flex-shrink-0">
                      {partner.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{partner.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{partner.department} • Year {partner.year}</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {partner.hostel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
                            {partner.matchScore}% Match
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">SKILLS</p>
                        <div className="flex flex-wrap gap-2">
                          {partner.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-full bg-help/10 text-help text-xs font-medium border border-help/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Can Help / Needs Help */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <BookOpen size={14} />
                            CAN HELP WITH
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {partner.canHelp.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-md bg-life/10 text-life text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <Users size={14} />
                            NEEDS HELP WITH
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {partner.needsHelp.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-md bg-opportunity/10 text-opportunity text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>Available: {partner.availability}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          to={`/profile/${partner.id}`}
                          className="flex-1 h-10 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 font-semibold transition-all shadow-button flex items-center justify-center"
                        >
                          View Profile
                        </Link>
                        <button className="flex-1 h-10 px-4 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 font-semibold transition-all flex items-center justify-center">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredPartners.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-primary" />
                  </div>
                  <h3 className="text-heading-3 font-heading font-semibold mb-2">
                    No partners found
                  </h3>
                  <p className="text-body-regular text-muted-foreground mb-6">
                    Try adjusting your filters to find more study partners
                  </p>
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
