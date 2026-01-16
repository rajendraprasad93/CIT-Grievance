import { Link } from 'react-router-dom';
import { ArrowRight, Users, MessageCircle, Briefcase, AlertTriangle, CheckCircle, GraduationCap, Star, Zap, Play, Shield, Clock, TrendingUp } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/university-logo.jpg" 
                alt="University Logo" 
                className="h-10 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">CCCP</span>
                <span className="ml-2 text-xs text-gray-500 font-medium">Campus Connect</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 text-gray-700 hover:text-amber-600 font-medium text-sm transition-colors">
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Campus Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/campus-hero.jpg" 
            alt="Campus" 
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay - stronger on left for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium">500+ students already connected</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Your Campus,
                <br />
                <span className="text-amber-400">Your Community</span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                Connect with classmates, discover opportunities, share moments, and make your campus life extraordinary.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link
                  to="/login"
                  className="group flex items-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-xl transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-400/40 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="group flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                >
                  <Play size={18} className="text-amber-400" />
                  Watch Demo
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-4xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-400">Active Students</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-4xl font-bold text-white">1000+</div>
                  <div className="text-sm text-gray-400">Posts Shared</div>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div>
                  <div className="text-4xl font-bold text-amber-400">98%</div>
                  <div className="text-sm text-gray-400">Issues Resolved</div>
                </div>
              </div>
            </div>

            {/* Right Side - Floating App Previews */}
            <div className="hidden lg:block relative h-[600px]">
              {/* Main Preview - Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] z-20 animate-float">
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-white/20">
                  <img 
                    src="/app-preview-1.png" 
                    alt="Dashboard Preview" 
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Secondary Preview - Top Right */}
              <div className="absolute top-8 right-0 w-[280px] z-10 animate-float-delayed">
                <div className="bg-white rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="/app-preview-2.png" 
                    alt="Community Feed" 
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Third Preview - Bottom Left */}
              <div className="absolute bottom-8 left-0 w-[260px] z-10 animate-float-slow">
                <div className="bg-white rounded-2xl shadow-xl shadow-black/20 overflow-hidden border border-white/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="/app-preview-3.png" 
                    alt="Opportunities" 
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-20 left-10 w-20 h-20 bg-amber-500/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-32 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-20 w-16 h-16 bg-emerald-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">Trusted by students from</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <div className="flex items-center gap-3 text-gray-400">
              <GraduationCap size={28} />
              <span className="font-semibold text-lg">Computer Science</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <GraduationCap size={28} />
              <span className="font-semibold text-lg">Information Technology</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <GraduationCap size={28} />
              <span className="font-semibold text-lg">AI & ML</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <GraduationCap size={28} />
              <span className="font-semibold text-lg">Electronics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              FEATURES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <span className="text-amber-500"> Campus Life</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Three powerful features designed to make your college experience better, more connected, and more productive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 right-6 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <MessageCircle size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Campus Community</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Share moments, ask for help, find study partners, and stay connected with your campus community.
                </p>
                <ul className="space-y-3">
                  {['Real-time discussions', 'Study groups & events', 'Campus announcements'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-blue-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Briefcase size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Opportunities Hub</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Never miss scholarships, internships, workshops, or career opportunities tailored for you.
                </p>
                <ul className="space-y-3">
                  {['Verified internships', 'Scholarship alerts', 'Workshop registrations'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-emerald-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-8 border border-rose-100 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-6 right-6 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Issue Tracker</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Report campus issues, track their resolution, and make your voice heard by the administration.
                </p>
                <ul className="space-y-3">
                  {['Public issue tracking', 'Real-time status updates', 'Community voting'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-rose-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get Started in <span className="text-amber-400">3 Simple Steps</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Join your campus community in less than a minute
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your campus email for instant verification', icon: '✨', color: 'amber' },
              { step: '02', title: 'Connect & Explore', desc: 'Find classmates, join groups, and discover opportunities', icon: '🤝', color: 'blue' },
              { step: '03', title: 'Engage & Grow', desc: 'Share moments, report issues, and build your network', icon: '🚀', color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-700 to-gray-800"></div>
                )}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 hover:border-amber-500/50 transition-all group-hover:-translate-y-2 duration-300">
                  <div className="text-5xl mb-6">{item.icon}</div>
                  <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold mb-4">
                    STEP {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by <span className="text-amber-500">Students</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              See what your fellow students are saying about CCCP
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', dept: 'CSE, 3rd Year', text: 'Found my internship through CCCP! The opportunities section is a goldmine for students.', avatar: 'P' },
              { name: 'Rahul Kumar', dept: 'IT, 2nd Year', text: 'The issue tracker actually works. Reported a hostel problem and it was fixed in 2 days!', avatar: 'R' },
              { name: 'Ananya Reddy', dept: 'AIML, 4th Year', text: 'Best platform to connect with seniors and juniors. Made so many friends through study groups.', avatar: 'A' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.dept}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Students', icon: Users },
              { value: '1000+', label: 'Posts Shared', icon: MessageCircle },
              { value: '50+', label: 'Issues Resolved', icon: CheckCircle },
              { value: '100+', label: 'Opportunities', icon: Briefcase },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={32} className="text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <br />
            <span className="text-amber-400">Campus Experience?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of students who are already making the most of their college life with CCCP.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="group flex items-center gap-3 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-lg rounded-xl transition-all shadow-2xl shadow-amber-500/30 hover:shadow-amber-400/40 hover:scale-105"
            >
              Get Started Free
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield size={18} />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span className="text-sm">Setup in 60 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} />
              <span className="text-sm">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/university-logo.jpg" 
                alt="University Logo" 
                className="h-10 w-auto object-contain brightness-0 invert opacity-80"
              />
              <div>
                <span className="text-lg font-bold text-white">CCCP</span>
                <p className="text-xs text-gray-500">Campus Connect Community Platform</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Built with 💛 for students, by students
            </p>
            <div className="text-sm text-gray-600">
              © 2026 Chennai Institute of Technology
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
