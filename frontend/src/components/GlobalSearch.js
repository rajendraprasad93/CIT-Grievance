import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * GlobalSearch Component - HelloTalk-style search
 * Searches moments, people, and opportunities
 */
function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    moments: [],
    people: [],
    opportunities: [],
  });
  const [recentSearches, setRecentSearches] = useState([
    'DBMS notes',
    'Study partner',
    'WiFi issues',
  ]);
  const [suggestedSearches] = useState([
    'Scholarship opportunities',
    'Hostel complaints',
    'Project partners',
    'Career guidance',
  ]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults({ moments: [], people: [], opportunities: [] });
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulating search results
      setTimeout(() => {
        setResults({
          moments: [
            {
              id: 1,
              title: 'DBMS revision group forming',
              type: 'help',
              author: 'Priya Sharma',
            },
            {
              id: 2,
              title: 'WiFi issues in common room',
              type: 'issue_observation',
              author: 'Rohit Kumar',
            },
          ],
          people: [
            {
              id: 1,
              name: 'Priya Sharma',
              department: 'CSE',
              year: 3,
            },
          ],
          opportunities: [
            {
              id: 1,
              title: 'Google STEP Internship',
              deadline: '2026-01-15',
            },
          ],
        });
        setLoading(false);
      }, 300);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    // Add to recent searches
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ moments: [], people: [], opportunities: [] });
  };

  if (!isOpen) return null;

  const hasResults =
    results.moments.length > 0 ||
    results.people.length > 0 ||
    results.opportunities.length > 0;

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
          <div className="p-6 border-b border-gray-200 bg-cit-navy">
            <div className="relative">
              <Search
                size={24}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search moments, people, opportunities..."
                className="w-full h-14 pl-14 pr-12 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-cit-gold focus:border-cit-gold transition-all"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : hasResults ? (
              <div className="p-6 space-y-6">
                {/* Moments Results */}
                {results.moments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <FileText size={16} />
                      MOMENTS
                    </h3>
                    <div className="space-y-2">
                      {results.moments.map((moment) => (
                        <Link
                          key={moment.id}
                          to={`/community/${moment.id}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl hover:bg-primary/5 transition-colors"
                        >
                          <p className="font-semibold text-sm mb-1">
                            {moment.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {moment.author} • {moment.type}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* People Results */}
                {results.people.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <User size={16} />
                      PEOPLE
                    </h3>
                    <div className="space-y-2">
                      {results.people.map((person) => (
                        <Link
                          key={person.id}
                          to={`/profile/${person.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold">
                            {person.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {person.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {person.department} • Year {person.year}
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
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      OPPORTUNITIES
                    </h3>
                    <div className="space-y-2">
                      {results.opportunities.map((opp) => (
                        <Link
                          key={opp.id}
                          to={`/opportunities/${opp.id}`}
                          onClick={onClose}
                          className="block p-3 rounded-xl hover:bg-opportunity/5 transition-colors"
                        >
                          <p className="font-semibold text-sm mb-1">
                            {opp.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Deadline: {opp.deadline}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : query.length > 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No results found for "{query}"
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Recent Searches */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    RECENT SEARCHES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search)}
                        className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggested Searches */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp size={16} />
                    SUGGESTED
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search)}
                        className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
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
