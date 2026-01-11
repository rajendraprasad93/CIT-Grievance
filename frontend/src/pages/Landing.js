import { Link } from 'react-router-dom';
import { ArrowRight, Users, MessageCircle, Briefcase, AlertTriangle, CheckCircle, GraduationCap, Star, Zap } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">CCCP</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors">
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium">500+ students already connected</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Campus,
              <br />
              <span className="text-amber-500">Your Community</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Connect with classmates, discover opportunities, share moments, and make your campus life better. 🎓
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <Link
                to="/login"
                className="group flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Students</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-500">Issues Fixed</div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3">
                    <GraduationCap size={32} className="text-amber-500" />
                  </div>
                  <p className="text-gray-600 font-medium text-sm">Campus Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Everything for Campus Life
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Three powerful features to make your college experience better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Campus Community</h3>
              <p className="text-gray-600 text-sm mb-4">
                Share moments, ask for help, and connect with your peers.
              </p>
              <ul className="space-y-2">
                {['Study groups', 'Campus updates', 'Discussions'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Briefcase size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Opportunities Hub</h3>
              <p className="text-gray-600 text-sm mb-4">
                Never miss scholarships, internships, or workshops.
              </p>
              <ul className="space-y-2">
                {['Internships', 'Workshops', 'Verified jobs'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <AlertTriangle size={24} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Issue Tracker</h3>
              <p className="text-gray-600 text-sm mb-4">
                Report campus issues and track their resolution.
              </p>
              <ul className="space-y-2">
                {['Public tracking', 'Status updates', 'Community support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Get Started in 3 Steps
            </h2>
            <p className="text-gray-600">
              Join your campus community in less than a minute
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Sign Up', desc: 'Use your campus email', emoji: '✨' },
              { step: '02', title: 'Connect', desc: 'Find your classmates', emoji: '🤝' },
              { step: '03', title: 'Engage', desc: 'Share and help others', emoji: '🚀' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <div className="text-xs font-bold text-amber-600 mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Join?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Start connecting with your campus community today. It's free!
          </p>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all"
          >
            Get Started Now
            <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            No credit card • Instant access • Campus verified
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">CCCP</span>
          </div>
          <p className="text-gray-500 text-sm mb-3">
            Built for students, by students. 💛
          </p>
          <div className="text-xs text-gray-600">
            © 2026 CIT Campus Connect • Chennai Institute of Technology
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
