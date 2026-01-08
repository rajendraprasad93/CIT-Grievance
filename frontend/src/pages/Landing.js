import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Search, AlertTriangle, CheckCircle, TrendingUp, MessageCircle, Briefcase, Award } from 'lucide-react';

function Landing() {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - CIT Style */}
      <nav className="fixed top-0 left-0 right-0 bg-cit-navy z-50 shadow-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/cit-logo.png" 
                alt="CIT Chennai" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-heading font-bold text-white hidden sm:block">CIT Campus Connect</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-6 rounded bg-cit-gold text-cit-navy hover:bg-[#e5a617] font-semibold transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - CIT Style */}
      <section className="pt-24 pb-16 px-4 bg-cit-navy text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cit-gold/20 text-cit-gold text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-cit-gold"></span>
                Welcome to CIT Campus Community
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white leading-[1.1]" data-testid="hero-title">
                Your Campus,
                <br />
                <span className="text-cit-gold">One Living Space</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                Connect with peers, discover opportunities, and make your voice heard. Everything you need for campus life in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="group inline-flex h-12 px-8 rounded bg-cit-gold text-cit-navy hover:bg-[#e5a617] font-semibold text-lg transition-all items-center justify-center gap-2 shadow-button"
                  data-testid="get-started-btn"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 px-8 rounded bg-white/10 border border-white/30 text-white hover:bg-white/20 font-semibold text-lg transition-all items-center justify-center gap-2"
                >
                  Sign In
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-cit-gold">500+</div>
                  <div className="text-sm text-white/70">Active Students</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold text-cit-gold">50+</div>
                  <div className="text-sm text-white/70">Issues Resolved</div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold text-cit-gold">100+</div>
                  <div className="text-sm text-white/70">Opportunities</div>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[500px]">
              <div className="relative h-full">
                <img
                  src="/cit-1.jpg"
                  alt="CIT Campus"
                  className="w-full h-full object-cover rounded shadow-card-hover border-4 border-white/20"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded shadow-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-cit-gold/20 flex items-center justify-center">
                      <Users className="text-cit-navy" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-cit-navy">Active Community</div>
                      <div className="text-sm text-gray-500">Join the conversation</div>
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
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-cit-navy mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three powerful features to transform your campus experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white rounded border border-gray-200 p-8 hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 rounded bg-cit-navy flex items-center justify-center mb-6 group-hover:bg-cit-gold transition-colors">
                <MessageCircle className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-cit-navy">Campus Community</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Share moments, ask for help, and connect with peers. Your campus social hub.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Study groups & help requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Campus life updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Real-time discussions
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded border border-gray-200 p-8 hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 rounded bg-cit-navy flex items-center justify-center mb-6 group-hover:bg-cit-gold transition-colors">
                <Briefcase className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-cit-navy">Opportunities Hub</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Never miss scholarships, internships, or workshops. All verified by the community.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Scholarships & internships
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Workshops & events
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Career cell verified
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded border border-gray-200 p-8 hover:shadow-card-hover transition-all">
              <div className="w-14 h-14 rounded bg-cit-navy flex items-center justify-center mb-6 group-hover:bg-cit-gold transition-colors">
                <AlertTriangle className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-heading font-bold mb-3 text-cit-navy">Issue Tracker</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Report campus issues and track their resolution. Transparent and accountable.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Public issue tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Status updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-cit-gold" />
                  Community support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-cit-light">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-cit-navy mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded border border-gray-200 p-8 shadow-card h-full">
                <div className="w-12 h-12 rounded bg-cit-navy text-white flex items-center justify-center font-bold text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-heading font-bold text-cit-navy mb-3">Sign Up</h3>
                <p className="text-gray-600">
                  Use your campus ID to create your account. Quick and secure.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-cit-gold"></div>
            </div>
            <div className="relative">
              <div className="bg-white rounded border border-gray-200 p-8 shadow-card h-full">
                <div className="w-12 h-12 rounded bg-cit-navy text-white flex items-center justify-center font-bold text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-heading font-bold text-cit-navy mb-3">Explore & Connect</h3>
                <p className="text-gray-600">
                  Browse opportunities, join discussions, and report issues.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-cit-gold"></div>
            </div>
            <div className="bg-white rounded border border-gray-200 p-8 shadow-card">
              <div className="w-12 h-12 rounded bg-cit-gold text-cit-navy flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-heading font-bold text-cit-navy mb-3">Make Impact</h3>
              <p className="text-gray-600">
                Your voice matters. Help improve campus life for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-cit-navy text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-cit-gold mb-2">500+</div>
              <div className="text-white/80">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-cit-gold mb-2">1000+</div>
              <div className="text-white/80">Posts Shared</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-cit-gold mb-2">50+</div>
              <div className="text-white/80">Issues Resolved</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-cit-gold mb-2">100+</div>
              <div className="text-white/80">Opportunities</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-cit-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-cit-navy">
            Ready to Join Your Campus Community?
          </h2>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Start connecting, discovering, and making a difference today. It's free and takes less than a minute.
          </p>
          <Link
            to="/login"
            className="group inline-flex h-14 px-12 rounded bg-cit-navy text-white hover:bg-[#003875] font-bold text-xl transition-all items-center justify-center gap-3 shadow-button"
            data-testid="cta-get-started"
          >
            Get Started Now
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Instant access • Campus ID verified
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/login" className="text-cit-gold font-semibold hover:text-cit-navy">
              Sign Up
            </Link>
            <span className="text-gray-400">•</span>
            <Link to="/login" className="text-cit-gold font-semibold hover:text-cit-navy">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-cit-navy text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/cit-logo.png" 
              alt="CIT Chennai" 
              className="h-10 w-auto"
            />
            <span className="text-xl font-heading font-bold text-white">CIT Campus Connect</span>
          </div>
          <p className="text-white/70 mb-4">
            Built for students, by students. Making campus life better together.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-white/60">
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
