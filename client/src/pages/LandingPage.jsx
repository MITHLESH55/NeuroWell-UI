import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Brain, Users, Shield } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter">
          <span className="text-primary">Neuro</span>Well
        </div>
        <div className="space-x-4">
          <Link to="/login" className="font-medium text-gray-600 hover:text-primary transition-colors">Login</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            AI-Powered Wellness 2.0
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-tight">
            Your personal AI coach for <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              peak mental performance
            </span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            NeuroWell analyzes your daily habits, stress levels, and mood to generate 
            dynamic plans that actually work.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/signup" className="btn-primary text-lg px-8 py-4">Start Free Trial</Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-4">View Demo</Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-32 text-left">
          {[
            { icon: Brain, title: 'AI Insights', desc: 'Predictive analytics for your health trends' },
            { icon: Activity, title: 'Adaptive Goals', desc: 'Goals that shift based on your completion rate' },
            { icon: Users, title: 'Community Hub', desc: 'Connect with peers on the same journey' },
            { icon: Shield, title: 'Private & Secure', desc: 'Your health data is fully encrypted' }
          ].map((feat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <feat.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
              <p className="text-gray-500">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
