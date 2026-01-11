import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, User, FileText, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';

/**
 * GlobalSearch Component - Connected to backend
 * Searches moments, people, opportunities, and issues
 */
function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    moments: [],
    people: [],
    opportunities: [],
    issues: [],
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : ['DBMS notes', 'Study partner', 'WiFi issues'];
  });
  const [suggestedSearches] = useState([
    'Scholarship opportunities',
    'Hostel complaints',
    'Project partners',
    'Career guidance',
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Debounce search
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults({ moments: [], people: [], opportunities: [], issues: [] });
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults({
        moments: data.moments || [],
        people: data.people || [],
        opportunities: data.opportunities || [],
        issues: data.issues || [],
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ moments: [], people: [], opportunities: [], issues: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    // Add to recent searches
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      const newRecent = [searchQuery, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ moments: [], people: [], opportunities: [], issues: [] });
  };

  if (!isOpen) return null;

  const hasResults =
    results.moments.length > 0 ||
    results.people.length > 0 ||
    results.opportunities.length > 0 ||
    results.issues.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50"
      onClick={onClose}
    >
      <div className="max-w-3xl mx-auto px-4 pt-20">
        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search moments, people, opportunities..."
                className="w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
              </div>
            ) : hasResults ? (
              <div className="p-6 space-y-6">
                {/* Moments Results */}
                {results.moments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <FileText size={14} />
                      MOMENTS
                    </h3>
                    <div className="space-y-2">
                      {results.moments.map((moment) => (
                        <Link
                          key={moment.moment_id}
                          to={`/community/${moment.moment_id}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {moment.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {moment.user_name} • {moment.moment_type}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* People Results */}
                {results.people.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <User size={14} />
                      PEOPLE
                    </h3>
                    <div className="space-y-2">
                      {results.people.map((person) => (
                        <Link
                          key={person.user_id}
                          to={`/profile/${person.user_id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          {person.picture ? (
                            <img
                              src={person.picture}
                              alt={person.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                              {person.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-gray-900">
                              {person.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {person.department} {person.year && `• Year ${person.year}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities Results */}
                {results.opportunities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <TrendingUp size={14} />
                      OPPORTUNITIES
                    </h3>
                    <div className="space-y-2">
                      {results.opportunities.map((opp) => (
                        <Link
                          key={opp.opp_id}
                          to={`/opportunities/${opp.opp_id}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {opp.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {opp.opp_type} {opp.deadline && `• Deadline: ${opp.deadline}`}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Issues Results */}
                {results.issues.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} />
                      ISSUES
                    </h3>
                    <div className="space-y-2">
                      {results.issues.map((issue) => (
                        <Link
                          key={issue.issue_id}
                          to={`/issues/${issue.issue_id}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl hover:bg-amber-50 transition-colors"
                        >
                          <p className="font-semibold text-sm text-gray-900 mb-1">
                            {issue.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {issue.category} • {issue.status} • {issue.affected_count} affected
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">
                  No results found for "{query}"
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <Clock size={14} />
                      RECENT SEARCHES
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearch(search)}
                          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Searches */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <TrendingUp size={14} />
                    SUGGESTED
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search)}
                        className="px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-medium transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearch;
