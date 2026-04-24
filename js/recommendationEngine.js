/**
 * NEUROWELL - Smart Recommendation Engine
 * Generates personalized, score-based recommendations and expert guidance.
 * Only uses local data.
 */

const SmartRecommendationEngine = {
  /**
   * Generates recommendations and doctor suggestions based on category scores.
   * @param {object} scores - The score data containing { physical, mental, emotional, overall }
   * @returns {object} { physical: [], mental: [], emotional: [], doctors: [] }
   */
  generateRecommendations: (scores) => {
    const recommendations = {
      physical: [],
      mental: [],
      emotional: [],
      doctors: []
    };

    // Helper to check if a doctor is already added
    const addDoctor = (doctor) => {
      if (!recommendations.doctors.some(d => d.title === doctor.title)) {
        recommendations.doctors.push(doctor);
      }
    };

    // ================= PHYSICAL HEALTH =================
    if (scores.physical < 40) {
      recommendations.physical.push(
        'Daily walking (20–30 mins)',
        'Light exercise routine',
        'Improve sleep schedule'
      );
    } else if (scores.physical >= 40 && scores.physical <= 70) {
      recommendations.physical.push(
        'Regular exercise (3–4 times/week)',
        'Balanced diet'
      );
    } else {
      recommendations.physical.push(
        'Maintain current routine',
        'Add strength training'
      );
    }
    
    // Always suggest a Physical expert, tailored to the score
    addDoctor({
      title: 'Physiotherapist & Fitness Coach',
      category: scores.physical < 40 ? 'Physical Recovery' : 'Physical Maintenance',
      icon: 'fa-user-md',
      description: scores.physical < 40 
        ? 'Your physical score is low. Get professional guidance for your recovery and safe movement.' 
        : 'Consult an expert to optimize your current fitness routine and prevent injuries.'
    });

    // ================= MENTAL HEALTH =================
    if (scores.mental < 40) {
      recommendations.mental.push(
        'Meditation (10–15 mins daily)',
        'Reduce screen time',
        'Journaling'
      );
    } else if (scores.mental >= 40 && scores.mental <= 70) {
      recommendations.mental.push(
        'Mindfulness practice',
        'Work-life balance improvement'
      );
    } else {
      recommendations.mental.push(
        'Maintain habits',
        'Occasional relaxation practices'
      );
    }

    // Always suggest a Mental expert, tailored to the score
    addDoctor({
      title: 'Psychologist',
      category: scores.mental < 40 ? 'Mental Support' : 'Mental Wellness',
      icon: 'fa-brain',
      description: scores.mental < 40
        ? 'Speak with a specialist immediately to improve your mental well-being and reduce stress.'
        : 'A check-in with a professional can help you maintain focus and a healthy mindset.'
    });

    // ================= EMOTIONAL HEALTH =================
    if (scores.emotional < 40) {
      recommendations.emotional.push(
        'Social interaction',
        'Talk to friends/family',
        'Emotional journaling'
      );
    } else if (scores.emotional >= 40 && scores.emotional <= 70) {
      recommendations.emotional.push(
        'Maintain relationships',
        'Stress management'
      );
    } else {
      recommendations.emotional.push(
        'Continue positive habits'
      );
    }

    // Always suggest an Emotional expert, tailored to the score
    addDoctor({
      title: 'Counselor',
      category: scores.emotional < 40 ? 'Emotional Healing' : 'Emotional Intelligence',
      icon: 'fa-hands-helping',
      description: scores.emotional < 40
        ? 'A safe space to talk and manage emotional stress is highly recommended right now.'
        : 'Continuous counseling can help you build stronger relationships and emotional resilience.'
    });

    // Default Nutritionist
    addDoctor({
      title: 'Nutritionist',
      category: 'Diet & Fuel',
      icon: 'fa-apple-alt',
      description: 'A balanced diet can significantly boost your overall scores and energy levels.'
    });

    return recommendations;
  }
};
