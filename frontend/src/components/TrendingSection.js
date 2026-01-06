import { TrendingUp, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function TrendingSection({ userContext }) {
  const trendingInHostel = [
    { text: "DBMS revision group forming", count: 12, emoji: "📚" },
    { text: "WiFi issues in common room", count: 8, emoji: "⚠️" },
    { text: "Weekend movie night plans", count: 15, emoji: "🎬" },
  ];

  const trendingInDept = [
    { text: "ML project partner needed", count: 9, emoji: "🤖" },
    { text: "OS exam tips from seniors", count: 18, emoji: "💡" },
    { text: "Hackathon team formation", count: 6, emoji: "💻" },
  ];

  const suggestedPeople = [
    { name: "Priya Sharma", role: "Python Tutor", dept: "CSE", avatar: null },
    { name: "Rohit Kumar", role: "Career Rep", dept: "Verified", avatar: null },
    { name: "Study Room: DBMS", role: "12 members", dept: "Active", avatar: null },
  ];

  return (
    <div className="space-y-6">
      {/* New Moments Alert - CIT Style */}
      <div className="bg-cit-navy rounded p-5 text-white shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded bg-cit-gold flex items-center justify-center">
            <span className="text-sm">🆕</span>
          </div>
          <p className="font-semibold text-sm">5 new moments in your hostel!</p>
        </div>
        <p className="text-xs text-white/80 mb-3">
          Check out what your neighbors are talking about
        </p>
        <button className="w-full rounded bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium text-white py-2">
          Refresh Feed
        </button>
      </div>

      {/* Trending in Your Hostel */}
      <div className="bg-white rounded border border-gray-200 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-cit-gold/20 flex items-center justify-center">
            <TrendingUp size={16} className="text-cit-navy" />
          </div>
          <h3 className="font-heading font-bold text-base text-cit-navy">
            Trending in Your Hostel
          </h3>
        </div>
        <div className="space-y-3">
          {trendingInHostel.map((item, idx) => (
            <button
              key={idx}
              className="w-full text-left p-3 rounded hover:bg-cit-light transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cit-navy group-hover:text-cit-gold transition-colors line-clamp-2">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.count} students talking about this
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button className="w-full mt-3 text-sm text-cit-navy font-medium hover:text-cit-gold transition-colors">
          See all trending →
        </button>
      </div>

      {/* Trending in Your Department */}
      <div className="bg-white rounded border border-gray-200 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-cit-navy/10 flex items-center justify-center">
            <Sparkles size={16} className="text-cit-navy" />
          </div>
          <h3 className="font-heading font-bold text-base text-cit-navy">
            Popular in {userContext?.department || "CSE"}
          </h3>
        </div>
        <div className="space-y-3">
          {trendingInDept.map((item, idx) => (
            <button
              key={idx}
              className="w-full text-left p-3 rounded hover:bg-cit-light transition-colors group"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cit-navy group-hover:text-cit-gold transition-colors line-clamp-2">
                    {item.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.count} students talking about this
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <button className="w-full mt-3 text-sm text-cit-navy font-medium hover:text-cit-gold transition-colors">
          Explore more →
        </button>
      </div>

      {/* Suggested for You */}
      <div className="bg-white rounded border border-gray-200 p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-cit-gold/20 flex items-center justify-center">
            <Users size={16} className="text-cit-navy" />
          </div>
          <h3 className="font-heading font-bold text-base text-cit-navy">
            Suggested for You
          </h3>
        </div>
        <div className="space-y-3">
          {suggestedPeople.map((person, idx) => (
            <div
              key={idx}
              className="w-full text-left p-3 rounded hover:bg-cit-light transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-cit-navy flex items-center justify-center text-white text-sm font-bold">
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-10 h-10 rounded"
                    />
                  ) : (
                    person.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cit-navy group-hover:text-cit-gold transition-colors">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {person.role} • {person.dept}
                  </p>
                </div>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1 rounded bg-cit-gold text-cit-navy text-xs font-semibold hover:bg-[#e5a617] transition-colors"
                >
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/find-partners"
          className="block w-full mt-3 text-sm text-cit-navy font-medium hover:text-cit-gold transition-colors text-center"
        >
          Find more people →
        </Link>
      </div>
    </div>
  );
}

export default TrendingSection;
