import { Link } from 'react-router-dom';
import { ArrowRight, Users, Search, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Landing() {
  const handleGetStarted = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/community';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight text-primary mb-6" data-testid="hero-title">
                YOUR CAMPUS,
                <br />
                IN ONE LIVING SPACE
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Study together, share opportunities, and fix campus issues — out in the open.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex h-12 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all items-center justify-center gap-2 shadow-sm"
                  data-testid="get-started-btn"
                >
                  Get Started with Campus ID
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/928218/pexels-photo-928218.jpeg"
                alt="Campus community"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-destructive" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">MISSED OPPORTUNITIES</h3>
              <p className="text-muted-foreground">Scholarships lost in mails.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Users className="text-destructive" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">INVISIBLE HELP</h3>
              <p className="text-muted-foreground">Study groups hidden in DMs.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-destructive" size={32} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">BLACK-HOLE COMPLAINTS</h3>
              <p className="text-muted-foreground">Issues vanish into forms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-center mb-12">What CCCP Does</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Users className="text-accent" size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">CAMPUS LIFE</h3>
              <p className="text-muted-foreground">
                Find peers, events, and daily updates.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Search className="text-accent" size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">INFO HUNTER</h3>
              <p className="text-muted-foreground">
                Crowd-check scholarships & internships.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <CheckCircle className="text-accent" size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3">CIVIC LAYER</h3>
              <p className="text-muted-foreground">
                Report issues once, track them in public.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-12">How It Works in 3 Steps</h2>
          <div className="space-y-8 text-left">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Share a Moment</h3>
                <p className="text-muted-foreground">Post help requests, info, or observations.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Reacts & Confirms</h3>
                <p className="text-muted-foreground">Others upvote, comment, and validate.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">CCCP Turns Patterns into Signals</h3>
                <p className="text-muted-foreground">Campus teams see trends and act on them.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-6">
            Built with student unions, hostel offices, and career cells.
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <CheckCircle size={24} />
              <span>Transparent status tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={24} />
              <span>Student-controlled identity</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={24} />
              <span>No spammy ads</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Join Your Campus Community
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start making campus better, one moment at a time.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex h-12 px-8 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium transition-all items-center justify-center gap-2 shadow-sm"
            data-testid="cta-get-started"
          >
            Get Started Now
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;