import { Link } from 'react-router-dom';
import { ArrowRight, Users, Search, AlertTriangle, CheckCircle, TrendingUp, MessageCircle, Briefcase, Award } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function Landing() {
  const handleGetStarted = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/community';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-heading font-bold text-primary">CIT Campus Connect</span>
            </div>
            <button
              onClick={handleGetStarted}
              className="h-10 px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                Welcome to CIT Campus Community
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-primary leading-[1.1]" data-testid="hero-title">
                Your Campus,
                <br />
                <span className="text-accent">One Living Space</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                Connect with peers, discover opportunities, and make your voice heard. Everything you need for campus life in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="group inline-flex h-14 px-8 rounded-full bg-accent text-white hover:bg-accent/90 font-semibold text-lg transition-all items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  data-testid="get-started-btn"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex h-14 px-8 rounded-full bg-white border-2 border-border text-primary hover:bg-slate-50 font-semibold text-lg transition-all items-center justify-center gap-2"
                >
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-muted-foreground">Issues Resolved</div>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div>
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-sm text-muted-foreground">Opportunities</div>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 via-primary/20 to-transparent rounded-3xl blur-3xl"></div>
              <div className="relative h-full">
                <img
                  src="/cit-1.jpg"
                  alt="CIT Campus"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <Users className="text-accent" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-primary">Active Community</div>
                      <div className="text-sm text-muted-foreground">Join the conversation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three powerful features to transform your campus experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3 text-primary">Campus Community</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Share moments, ask for help, and connect with peers. Your campus social hub.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-500" />
                  Study groups & help requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-500" />
                  Campus life updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-blue-500" />
                  Real-time discussions
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3 text-primary">Opportunities Hub</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Never miss scholarships, internships, or workshops. All verified by the community.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-purple-500" />
                  Scholarships & internships
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-purple-500" />
                  Workshops & events
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-purple-500" />
                  Career cell verified
                </li>
              </ul>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-3 text-primary">Issue Tracker</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Report campus issues and track their resolution. Transparent and accountable.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Public issue tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Status updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  Community support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm h-full">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">Sign Up</h3>
                <p className="text-muted-foreground">
                  Use your campus ID to create your account. Quick and secure.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-accent/30"></div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 border border-border shadow-sm h-full">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">Explore & Connect</h3>
                <p className="text-muted-foreground">
                  Browse opportunities, join discussions, and report issues.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-accent/30"></div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Make Impact</h3>
              <p className="text-muted-foreground">
                Your voice matters. Help improve campus life for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-primary-foreground/80">Posts Shared</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-primary-foreground/80">Issues Resolved</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-primary-foreground/80">Opportunities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-accent/5 to-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-primary">
            Ready to Join Your Campus Community?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Start connecting, discovering, and making a difference today. It's free and takes less than a minute.
          </p>
          <button
            onClick={handleGetStarted}
            className="group inline-flex h-16 px-12 rounded-full bg-accent text-white hover:bg-accent/90 font-bold text-xl transition-all items-center justify-center gap-3 shadow-xl hover:shadow-2xl"
            data-testid="cta-get-started"
          >
            Get Started Now
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • Instant access • Campus ID verified
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-heading font-bold text-primary">CIT Campus Connect</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Built for students, by students. Making campus life better together.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>© 2026 CIT Campus Connect</span>
            <span>•</span>
            <span>Chennai Institute of Technology</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;