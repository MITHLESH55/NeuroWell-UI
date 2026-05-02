import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter block mb-2">
            <span className="text-primary">Neuro</span>Well
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Create an account</h2>
          <p className="text-gray-500 text-sm mt-1">Start your wellness journey today.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Create a password"
            />
          </div>
          
          <button type="button" className="w-full btn-primary mt-6">
            Get Started Free
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
