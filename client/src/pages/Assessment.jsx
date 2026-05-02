import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Assessment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sleepHours: 7,
    stressLevel: 5,
    activityLevel: 5,
    mood: 'Neutral'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Use mock token for demonstration if none exists, to allow bypass without auth wall
      const authToken = token || 'mock-token'; 

      console.log('Saving Assessment Data:', formData);

      const res = await fetch('http://localhost:5000/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      console.log('Assessment Saved:', data);

      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message || 'Error saving assessment');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      // For local demo without running server, manually set data
      localStorage.setItem('demo_wellness_data', JSON.stringify({
        scores: { overall: 75, physical: 80, mental: 70, emotional: 75 },
        burnoutRisk: formData.stressLevel * 10
      }));
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Wellness Check</h2>
        <p className="text-gray-500 mb-8">Let's see how you're doing today to personalize your dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours of Sleep: <span className="text-primary font-bold">{formData.sleepHours}h</span>
            </label>
            <input 
              type="range" min="0" max="12" step="1"
              value={formData.sleepHours}
              onChange={(e) => setFormData({...formData, sleepHours: parseInt(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stress Level (1-10): <span className="text-primary font-bold">{formData.stressLevel}</span>
            </label>
            <input 
              type="range" min="1" max="10" step="1"
              value={formData.stressLevel}
              onChange={(e) => setFormData({...formData, stressLevel: parseInt(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level (1-10): <span className="text-primary font-bold">{formData.activityLevel}</span>
            </label>
            <input 
              type="range" min="1" max="10" step="1"
              value={formData.activityLevel}
              onChange={(e) => setFormData({...formData, activityLevel: parseInt(e.target.value)})}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Mood</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Happy', 'Energetic', 'Neutral', 'Stressed', 'Sad'].map(mood => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData({...formData, mood})}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                    formData.mood === mood 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary mt-8"
          >
            {loading ? 'Analyzing...' : 'Complete Assessment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Assessment;
