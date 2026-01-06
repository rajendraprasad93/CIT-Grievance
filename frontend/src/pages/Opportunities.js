import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Eye, Calendar, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiGet } from "../lib/api";

function Opportunities({ user }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchOpportunities = useCallback(async () => {
    try {
      let endpoint = "/api/opportunities";
      if (filter) endpoint += `?opp_type=${filter}`;

      const data = await apiGet(endpoint);
      setOpportunities(data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const getTypeColor = (type) => {
    const colors = {
      scholarship: "bg-purple-50 text-purple-700 border-purple-200",
      internship: "bg-blue-50 text-blue-700 border-blue-200",
      workshop: "bg-green-50 text-green-700 border-green-200",
      resource: "bg-amber-50 text-amber-700 border-amber-200",
    };
    return colors[type] || colors.internship;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1
            className="text-3xl font-heading font-bold mb-2"
            data-testid="opportunities-title"
          >
            Opportunities & Resources
          </h1>
          <p className="text-muted-foreground">
            Discover scholarships, internships, and resources for your academic
            journey.
          </p>
        </div>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
          data-testid="opportunity-filters"
        >
          <button
            onClick={() => setFilter("")}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
              filter === ""
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("scholarship")}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
              filter === "scholarship"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Scholarships
          </button>
          <button
            onClick={() => setFilter("internship")}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
              filter === "internship"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Internships
          </button>
          <button
            onClick={() => setFilter("workshop")}
            className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
              filter === "workshop"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            Workshops
          </button>
        </div>

        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="opportunities-list"
        >
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No opportunities found.</p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <Link
                key={opp.opp_id}
                to={`/opportunities/${opp.opp_id}`}
                className="bg-card rounded-xl border border-border p-6 hover:shadow-md hover:border-accent/50 transition-all group"
                data-testid={`opportunity-card-${opp.opp_id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(
                      opp.opp_type
                    )}`}
                  >
                    {opp.opp_type.toUpperCase()}
                  </span>
                  {opp.verified && (
                    <div
                      className="flex items-center gap-1 text-accent"
                      title="Verified by Career Cell"
                    >
                      <Award size={16} />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-heading font-semibold mb-2 group-hover:text-accent transition-colors">
                  {opp.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {opp.description}
                </p>

                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <span className="font-medium">{opp.organization}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Bookmark size={14} />
                    <span>{opp.saved_count || 0} saved</span>
                  </div>
                  {opp.deadline && (
                    <div className="flex items-center gap-1 text-destructive">
                      <Calendar size={14} />
                      <span>{new Date(opp.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Opportunities;
