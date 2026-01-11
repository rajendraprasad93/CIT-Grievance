import { useState } from 'react';
import { 
  Flame, BookOpen, Sparkles, Briefcase, AlertTriangle,
  Home, Users, Building, GraduationCap, MapPin, Filter, X
} from 'lucide-react';

function FeedFilterTabs({ 
  selectedTab, 
  onTabChange, 
  filters, 
  onFilterChange 
}) {
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    { id: 'all', label: 'All', icon: Flame, emoji: '🔥' },
    { id: 'help', label: 'Study', icon: BookOpen, emoji: '📚' },
    { id: 'campus_life', label: 'Life', icon: Sparkles, emoji: '🎓' },
    { id: 'opportunity', label: 'Opps', icon: Briefcase, emoji: '💼' },
    { id: 'issue_observation', label: 'Issues', icon: AlertTriangle, emoji: '⚠️' },
  ];

  const hasActiveFilters = filters.hostel || filters.department || filters.year;

  return (
    <div className="space-y-3">
      {/* Main Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                selectedTab === tab.id
                  ? 'bg-gradient-to-r from-cit-navy to-cit-navy-light text-white shadow-lg shadow-cit-navy/20'
                  : 'bg-white text-gray-600 hover:bg-cit-light border border-gray-200 hover:border-cit-gold/30'
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            showFilters || hasActiveFilters
              ? 'bg-cit-gold text-cit-navy'
              : 'bg-white text-gray-600 hover:bg-cit-light border border-gray-200'
          }`}
        >
          <Filter size={16} />
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-hot-pink animate-pulse" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-cit-navy text-sm">Filter Feed</h4>
            {hasActiveFilters && (
              <button
                onClick={() => onFilterChange({ hostel: '', department: '', year: '' })}
                className="flex items-center gap-1 text-xs text-hot-pink hover:text-hot-pink/80 font-medium"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Hostel Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Home size={12} />
                Hostel
              </label>
              <select
                value={filters.hostel}
                onChange={(e) => onFilterChange({ ...filters, hostel: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold/50 focus:border-cit-gold transition-all"
              >
                <option value="">All</option>
                <option value="A-Block">A-Block</option>
                <option value="B-Block">B-Block</option>
                <option value="C-Block">C-Block</option>
                <option value="D-Block">D-Block</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <Building size={12} />
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold/50 focus:border-cit-gold transition-all"
              >
                <option value="">All</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="IT">IT</option>
                <option value="AIML">AIML</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                <GraduationCap size={12} />
                Year
              </label>
              <select
                value={filters.year}
                onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cit-gold/50 focus:border-cit-gold transition-all"
              >
                <option value="">All</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">Quick:</span>
            <button
              onClick={() => onFilterChange({ ...filters, hostel: filters.hostel === 'A-Block' ? '' : 'A-Block' })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.hostel === 'A-Block'
                  ? 'bg-cit-gold text-cit-navy'
                  : 'bg-gray-100 text-gray-600 hover:bg-cit-gold/20'
              }`}
            >
              🏠 My Hostel
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, department: filters.department === 'CSE' ? '' : 'CSE' })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.department === 'CSE'
                  ? 'bg-cit-gold text-cit-navy'
                  : 'bg-gray-100 text-gray-600 hover:bg-cit-gold/20'
              }`}
            >
              📚 My Dept
            </button>
            <button
              onClick={() => onFilterChange({ ...filters, year: filters.year === '3' ? '' : '3' })}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filters.year === '3'
                  ? 'bg-cit-gold text-cit-navy'
                  : 'bg-gray-100 text-gray-600 hover:bg-cit-gold/20'
              }`}
            >
              🎓 My Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedFilterTabs;
