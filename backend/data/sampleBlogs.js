/**
 * NEUROWELL - Sample Blog Data
 * Pre-populated blog posts for the knowledge hub
 * Run this script to seed the database with initial content
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Blog = require('../models/Blog');
const User = require('../models/User');

const sampleBlogs = [
  {
    title: "The Science of Sleep: Why Quality Rest Matters for Mental Health",
    content: `
      <h2>The Critical Role of Sleep in Mental Wellness</h2>
      <p>Sleep is not just a passive state of rest—it's an active period of restoration for both body and mind. During sleep, your brain processes emotions, consolidates memories, and clears out toxins that accumulate during waking hours.</p>

      <h3>How Sleep Affects Mental Health</h3>
      <p>Chronic sleep deprivation can lead to:</p>
      <ul>
        <li>Increased anxiety and depression symptoms</li>
        <li>Impaired emotional regulation</li>
        <li>Reduced cognitive function</li>
        <li>Higher stress hormone levels</li>
      </ul>

      <h3>Practical Tips for Better Sleep</h3>
      <ol>
        <li>Maintain a consistent sleep schedule</li>
        <li>Create a relaxing bedtime routine</li>
        <li>Limit screen time before bed</li>
        <li>Keep your bedroom cool and dark</li>
        <li>Avoid caffeine after 2 PM</li>
      </ol>

      <p>Remember, quality sleep is a foundation for mental wellness. Small changes in your sleep habits can lead to significant improvements in your overall well-being.</p>
    `,
    category: "sleep_health",
    tags: ["sleep", "mental health", "restoration", "wellness"],
    featured: true,
    status: "published"
  },
  {
    title: "Stress Management Techniques That Actually Work",
    content: `
      <h2>Understanding and Managing Stress</h2>
      <p>Stress is your body's natural response to challenging situations. While some stress can be motivating, chronic stress can negatively impact your health and well-being.</p>

      <h3>Effective Stress Management Strategies</h3>

      <h4>1. Deep Breathing Exercises</h4>
      <p>The 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. This activates your parasympathetic nervous system.</p>

      <h4>2. Progressive Muscle Relaxation</h4>
      <p>Systematically tense and relax different muscle groups in your body, starting from your toes and working up to your head.</p>

      <h4>3. Mindfulness Meditation</h4>
      <p>Practice being present in the moment. Start with 5 minutes daily and gradually increase the duration.</p>

      <h4>4. Physical Activity</h4>
      <p>Exercise releases endorphins, which are natural stress relievers. Even a 20-minute walk can make a difference.</p>

      <h3>When to Seek Professional Help</h3>
      <p>If stress is interfering with your daily life, relationships, or work performance, consider consulting a mental health professional.</p>
    `,
    category: "stress_management",
    tags: ["stress", "relaxation", "mindfulness", "coping strategies"],
    featured: true,
    status: "published"
  },
  {
    title: "Building a Sustainable Fitness Routine",
    content: `
      <h2>Creating Lasting Fitness Habits</h2>
      <p>Fitness isn't about extreme workouts or quick fixes—it's about building sustainable habits that support your long-term health and wellness goals.</p>

      <h3>The Foundation: Consistency Over Intensity</h3>
      <p>Research shows that consistency is more important than workout intensity for long-term success. Focus on activities you enjoy rather than pushing through exercises you hate.</p>

      <h3>Types of Exercise to Include</h3>
      <ul>
        <li><strong>Cardiovascular exercise:</strong> Walking, running, cycling, swimming</li>
        <li><strong>Strength training:</strong> Bodyweight exercises, weight lifting, resistance bands</li>
        <li><strong>Flexibility work:</strong> Yoga, stretching, Pilates</li>
        <li><strong>Mind-body practices:</strong> Tai Chi, dance, martial arts</li>
      </ul>

      <h3>Creating Your Fitness Plan</h3>
      <ol>
        <li>Assess your current fitness level honestly</li>
        <li>Choose activities you enjoy</li>
        <li>Start small and build gradually</li>
        <li>Schedule workouts like important appointments</li>
        <li>Track your progress and celebrate milestones</li>
        <li>Be flexible and adjust as needed</li>
      </ol>

      <h3>Overcoming Common Barriers</h3>
      <p><strong>Lack of time:</strong> Short, frequent workouts are often more effective than long, infrequent sessions.</p>
      <p><strong>Lack of motivation:</strong> Find an accountability partner or join a community.</p>
      <p><strong>Plateaus:</strong> Change your routine every 4-6 weeks to keep challenging your body.</p>
    `,
    category: "fitness_tips",
    tags: ["fitness", "exercise", "habits", "sustainability"],
    featured: false,
    status: "published"
  },
  {
    title: "Nutrition for Mental Wellness: Foods That Support Brain Health",
    content: `
      <h2>The Gut-Brain Connection</h2>
      <p>Your brain health is closely linked to your gut health. The foods you eat can influence neurotransmitter production, inflammation levels, and overall brain function.</p>

      <h3>Key Nutrients for Brain Health</h3>

      <h4>Omega-3 Fatty Acids</h4>
      <p>Found in fatty fish like salmon, sardines, and mackerel. Omega-3s support cell membrane health and reduce inflammation.</p>

      <h4>Antioxidants</h4>
      <p>Berries, dark leafy greens, and nuts contain antioxidants that protect brain cells from oxidative stress.</p>

      <h4>B Vitamins</h4>
      <p>Whole grains, eggs, and leafy greens provide B vitamins essential for neurotransmitter production.</p>

      <h4>Magnesium</h4>
      <p>Nuts, seeds, and dark chocolate help regulate neurotransmitter function and reduce anxiety.</p>

      <h3>Foods to Include Regularly</h3>
      <ul>
        <li>Fatty fish (salmon, mackerel, sardines)</li>
        <li>Berries (blueberries, strawberries, raspberries)</li>
        <li>Nuts and seeds (walnuts, flaxseeds, chia seeds)</li>
        <li>Dark leafy greens (spinach, kale, broccoli)</li>
        <li>Whole grains (oats, quinoa, brown rice)</li>
        <li>Fermented foods (yogurt, kefir, sauerkraut)</li>
      </ul>

      <h3>Foods to Limit</h3>
      <ul>
        <li>Processed foods high in sugar and refined carbs</li>
        <li>Trans fats and highly processed vegetable oils</li>
        <li>Excessive caffeine and alcohol</li>
        <li>Artificial sweeteners and food additives</li>
      </ul>

      <p>Focus on whole, nutrient-dense foods and stay hydrated. Small dietary changes can have a significant impact on your mental wellness.</p>
    `,
    category: "nutrition_guide",
    tags: ["nutrition", "brain health", "gut-brain axis", "mental wellness"],
    featured: false,
    status: "published"
  },
  {
    title: "Work-Life Balance: Protecting Your Mental Health in a Busy World",
    content: `
      <h2>The Importance of Boundaries</h2>
      <p>In our hyper-connected world, work can easily spill over into personal time. Setting clear boundaries is essential for maintaining mental health and preventing burnout.</p>

      <h3>Signs of Poor Work-Life Balance</h3>
      <ul>
        <li>Constantly checking work emails outside business hours</li>
        <li>Feeling guilty when not working</li>
        <li>Sleep disturbances due to work-related stress</li>
        <li>Neglecting personal relationships and hobbies</li>
        <li>Chronic fatigue and irritability</li>
      </ul>

      <h3>Strategies for Better Balance</h3>

      <h4>1. Set Clear Boundaries</h4>
      <p>Define specific work hours and stick to them. Turn off work notifications after hours.</p>

      <h4>2. Practice the "Shutdown Ritual"</h4>
      <p>End your workday with a specific routine that signals the transition to personal time.</p>

      <h4>3. Schedule Personal Time</h4>
      <p>Block out time for exercise, hobbies, and social activities in your calendar.</p>

      <h4>4. Learn to Say No</h4>
      <p>It's okay to decline additional work when you're already at capacity.</p>

      <h4>5. Create Work-Free Zones</h4>
      <p>Designate certain areas of your home as work-free zones.</p>

      <h3>The Role of Employers</h3>
      <p>Organizations play a crucial role in supporting work-life balance. Look for companies that:</p>
      <ul>
        <li>Respect work boundaries</li>
        <li>Offer flexible work arrangements</li>
        <li>Provide mental health resources</li>
        <li>Encourage time off</li>
        <li>Foster a culture of work-life balance</li>
      </ul>

      <p>Remember, work-life balance is not about dividing your time equally—it's about ensuring that work doesn't dominate your life at the expense of your health and relationships.</p>
    `,
    category: "work_life_balance",
    tags: ["work-life balance", "boundaries", "burnout prevention", "mental health"],
    featured: true,
    status: "published"
  },
  {
    title: "Mindfulness Practices for Daily Stress Reduction",
    content: `
      <h2>Bringing Awareness to the Present Moment</h2>
      <p>Mindfulness is the practice of being fully present and engaged with whatever we're doing at the moment, free from distraction or judgment.</p>

      <h3>Benefits of Mindfulness</h3>
      <ul>
        <li>Reduced stress and anxiety</li>
        <li>Improved focus and concentration</li>
        <li>Better emotional regulation</li>
        <li>Enhanced self-awareness</li>
        <li>Improved sleep quality</li>
      </ul>

      <h3>Simple Mindfulness Practices</h3>

      <h4>1. Mindful Breathing</h4>
      <p>Sit comfortably and focus on your breath. Notice the sensation of air entering and leaving your nostrils. When your mind wanders, gently bring it back to your breath.</p>

      <h4>2. Body Scan Meditation</h4>
      <p>Lie down and systematically bring awareness to different parts of your body, starting from your toes and moving up to your head. Notice any tension or sensations without judgment.</p>

      <h4>3. Mindful Eating</h4>
      <p>Eat slowly and pay attention to the taste, texture, and aroma of your food. Notice how your body feels as you eat.</p>

      <h4>4. Walking Meditation</h4>
      <p>Walk slowly and deliberately, paying attention to the sensation of your feet touching the ground and the movement of your body.</p>

      <h3>Getting Started</h3>
      <p>Start with just 5 minutes a day. Use a timer and find a quiet space where you won't be disturbed. Be patient with yourself—mindfulness is a skill that develops over time.</p>

      <p>Consistency is more important than duration. Even short daily practice can lead to significant benefits over time.</p>
    `,
    category: "mindfulness",
    tags: ["mindfulness", "meditation", "stress reduction", "present moment awareness"],
    featured: false,
    status: "published"
  }
];

async function seedBlogs() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create an admin user for blog posts
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'NeuroWell Admin',
        email: 'admin@neurowell.com',
        password: 'admin123456', // In production, use a strong password
        role: 'admin'
      });
      console.log('Created admin user');
    }

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Create blog posts one by one to trigger pre-save middleware
    const blogs = [];
    for (const blogData of sampleBlogs) {
      const blog = new Blog({
        ...blogData,
        author: adminUser._id
      });
      const savedBlog = await blog.save();
      blogs.push(savedBlog);
    }

    console.log(`Seeded ${blogs.length} blog posts`);

    console.log('Blog seeding completed successfully');

  } catch (error) {
    console.error('Error seeding blogs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedBlogs();
}

module.exports = { seedBlogs, sampleBlogs };