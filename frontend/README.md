# NeuroWell: AI-Driven Predictive Wellness Intelligence Platform

## 📋 Project Overview

**NeuroWell** is a professional, industry-level frontend web application that provides personalized wellness assessment, predictive analytics, and AI-driven recommendations. It uses a modular architecture with separation of concerns to deliver a scalable, maintainable SaaS-style platform.

### Key Features

- ✅ **Multi-Step Assessment** - 15 intelligent questions covering 3 wellness dimensions
- ✅ **Weighted Scoring Engine** - Advanced formula-based scoring logic
- ✅ **Burnout Risk Prediction** - Statistical analysis of burnout indicators
- ✅ **Visual Dashboard** - Interactive charts powered by Chart.js
- ✅ **Personalized Recommendations** - Rule-based AI recommendations
- ✅ **30-Day Wellness Plan** - Structured action plans with daily habits
- ✅ **Trend Analysis** - Historical data tracking and projections
- ✅ **Data Privacy** - 100% client-side storage using localStorage

---

## 📁 Project Structure (Following Best Practices)

```
neuro-well/
├── index.html                 # Landing page
├── assessment.html            # Multi-step assessment
├── dashboard.html             # Wellness analytics dashboard
├── recommendations.html       # Personalized recommendations
├── README.md                  # This file
│
├── css/
│   ├── main.css              # Design system, variables, base styles
│   ├── layout.css            # Navbar, footer, sections
│   ├── components.css        # Assessment UI, badges, cards
│   └── dashboard.css         # Modals, alerts, spinners
│
├── js/
│   ├── app.js                # Main app manager, initialization
│   ├── storage.js            # localStorage operations
│   ├── scoring.js            # Weighted scoring engine
│   ├── prediction.js         # Burnout risk & trend prediction
│   ├── recommendations.js    # Rule-based recommendation engine + page manager
│   ├── assessment.js         # Assessment form logic
│   └── dashboard.js          # Dashboard visualization & charts
│
├── components/
│   ├── navbar.html           # Navigation component (reusable)
│   ├── footer.html           # Footer component (reusable)
│   └── loader.html           # Loading spinner (reusable)
│
├── data/
│   ├── questions.js          # 15 assessment questions database
│   ├── rules.js              # Recommendation rules engine
│   └── constants.js          # Global constants & configuration
│
└── libs/
    └── chart.min.js          # Chart.js library (CDN loaded in dashboard.html)
```

---

## 🎯 Architecture Overview

### Modular Design Pattern

The application uses **strict separation of concerns** with clear module boundaries:

```
┌─────────────────────────────────────────────────┐
│           User Interface Layer (HTML/CSS)        │
│  (index, assessment, dashboard, recommendations) │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│         Presentation Layer (Page Managers)      │
│ (AssessmentManager, DashboardManager, etc.)     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│          Business Logic Layer (Engines)          │
│ (ScoringEngine, RecommendationEngine, etc.)     │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│           Data & Persistence Layer               │
│  (StorageManager, localStorage)                  │
└─────────────────────────────────────────────────┘
```

### Module Responsibilities

| Module                 | Responsibility                                                |
| ---------------------- | ------------------------------------------------------------- |
| **storage.js**         | Handles localStorage CRUD operations for all data             |
| **scoring.js**         | Calculates wellness scores using weighted formulas            |
| **prediction.js**      | Predicts burnout risk and future wellness trajectory          |
| **recommendations.js** | Generates personalized recommendations from rules             |
| **assessment.js**      | Manages multi-step assessment UI and flow                     |
| **dashboard.js**       | Renders charts and displays wellness visualizations           |
| **app.js**             | Coordinates app initialization and cross-module communication |

---

## 🧮 Scoring Logic Explanation

### Scoring Formula

The application uses a **weighted category-based scoring system** (0-100 scale):

#### 1. **Response Normalization**

```
Each question (1-5 scale) is normalized to 0-100:
normalized_score = (response_value / 5) × 100

For negative-impact questions (stress-based):
- Inverted: value = 6 - original_value
- Then normalized as above
```

#### 2. **Category Scoring** (Weighted Average)

```
Physical Score = Σ(normalized_score × weight) / Σ(weight)
Mental Score   = Σ(normalized_score × weight) / Σ(weight)
Emotional Score = Σ(normalized_score × weight) / Σ(weight)

Weights assigned based on question importance:
- Sleep, stress: 2.0-2.2 (highest impact)
- Exercise, mindfulness: 1.7-1.9 (medium impact)
- Others: 1.5-1.6 (baseline)
```

#### 3. **Overall Wellness Score** (Weighted Average)

```
Overall = (Physical × 0.35) + (Mental × 0.35) + (Emotional × 0.30)

Why these weights?
- Physical (35%): Foundation of wellness
- Mental (35%): Critical for burnout prevention
- Emotional (30%): Supporting factor for resilience
```

#### 4. **Burnout Risk Calculation**

```
Burnout Risk = (MentalFactor × 0.5) + (PhysicalFactor × 0.25) + (EmotionalFactor × 0.25)

Where:
MentalFactor = 100 - mental_score (inverse relationship)
PhysicalFactor = 100 - physical_score
EmotionalFactor = 100 - emotional_score

Risk Levels:
- Low: 0-30%
- Moderate: 31-60%
- High: 61-100%
```

### Example Calculation

**User Responses:**

- Q1 (Sleep): 3/5 → normalized = 60
- Q2 (Exercise): 2/5 → normalized = 40
- Q4 (Stress): 4/5 (negative impact) → inverted = 2/5 → normalized = 40

**Physical Category Calculation:**

```
Physical = (60×2.0 + 40×1.8 + ...) / total_weights = 55
```

---

## 🤖 AI Recommendation Engine

### Rule-Based Logic

The system uses **deterministic rule matching** (not ML):

```javascript
// Pseudo-code
RULES.forEach((rule) => {
  if (rule.condition(scores, burnoutRisk)) {
    // Add to recommendations
    recommendations.push(rule);
  }
});

// Sort by priority: CRITICAL → HIGH → MEDIUM → LOW
recommendations.sort(byPriority);
```

### Example Rules

| Rule                   | Condition          | Recommendation              |
| ---------------------- | ------------------ | --------------------------- |
| **MENTAL_STRESS_HIGH** | mental_score < 40  | Implement stress management |
| **BURNOUT_RISK_HIGH**  | burnout_risk > 70  | Seek professional support   |
| **WELLNESS_EXCELLENT** | overall_score ≥ 80 | Maintain healthy habits     |

---

## 📊 Data Models

### Assessment Response

```javascript
{
  responses: [
    { question_id: 1, value: 4 },
    { question_id: 2, value: 3 },
    // ... 15 total responses
  ],
  timestamp: "2024-04-18T10:30:00Z",
  version: "1.0"
}
```

### Wellness Score

```javascript
{
  scores: {
    overall: 72,
    physical: 75,
    mental: 68,
    emotional: 73
  },
  timestamp: "2024-04-18T10:30:00Z"
}
```

### Historical Data (for trend analysis)

```javascript
[
  {
    scores: { overall: 65, ... },
    timestamp: "2024-04-11T10:30:00Z"
  },
  {
    scores: { overall: 72, ... },
    timestamp: "2024-04-18T10:30:00Z"
  }
  // ... up to 12 records (rolling window)
]
```

---

## 🔐 Data Storage & Privacy

### localStorage Structure

```javascript
localStorage[
  ("neurowell_assessment_responses", // Current responses
  "neurowell_wellness_score", // Latest scores
  "neurowell_last_assessment_date", // Last assessment timestamp
  "neurowell_historical_data") // Historical scores array
];
```

### Security Features

- ✅ **100% Client-Side**: All data stored locally, never sent to server
- ✅ **Browser Storage**: Uses localStorage for persistence across sessions
- ✅ **Data Export**: Users can export JSON backup anytime
- ✅ **Data Reset**: Users can clear all data with one click
- ✅ **No Tracking**: No analytics or third-party data collection

---

## 🚀 How to Use the Application

### 1. Landing Page (index.html)

- Displays features and value proposition
- Two CTA buttons lead to assessment
- "Learn More" opens expanded information

### 2. Assessment Page (assessment.html)

```
User Flow:
Step 1 → Answer Q1-3 (Physical Health)
      ↓
Step 2 → Answer Q4-6 (Mental Health & Stress)
      ↓
Step 3 → Answer Q7-9 (Work-Life Balance)
      ↓
Step 4 → Answer Q10-12 (Emotional Wellness)
      ↓
Step 5 → Answer Q13-15 (Lifestyle & Habits)
      ↓
Submit → Calculate Scores → Redirect to Dashboard
```

- Progress indicator shows current step
- Can navigate back to previous steps
- All responses auto-saved to localStorage
- Validation prevents submission without all answers

### 3. Dashboard Page (dashboard.html)

Displays:

- 4 overview cards (Overall, Physical, Mental, Emotional)
- Category breakdown with progress bars
- Burnout risk gauge (0-100%)
- Bar chart (categories comparison)
- Line chart (wellness trend over time)
- Quick improvements section
- Top recommendations
- Export data button

### 4. Recommendations Page (recommendations.html)

Displays:

- Wellness summary (scores + burnout risk)
- Recommendations sorted by priority
- Quick wins for immediate action
- 30-Day wellness plan with daily habits
- Weekly focus areas
- Helpful resources
- Progress checkpoints
- 7/14/30-day wellness projections
- Risk analysis and protective factors

---

## 💻 Technical Stack

| Layer                | Technology                                      |
| -------------------- | ----------------------------------------------- |
| **Frontend**         | HTML5, CSS3, Vanilla JavaScript (ES6+)          |
| **Styling**          | Custom CSS with design system variables         |
| **State Management** | localStorage (client-side)                      |
| **Charts**           | Chart.js 3.9.1 (CDN)                            |
| **Architecture**     | Modular, object-based design                    |
| **Browser Support**  | Modern browsers (Chrome, Firefox, Safari, Edge) |

---

## 🔧 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📱 Responsive Design

The application is fully responsive:

- **Desktop**: Multi-column layouts, full charts
- **Tablet**: Adjusted grid (2-3 columns)
- **Mobile**: Single column, stacked layout

CSS media queries handle breakpoints:

- 1200px (desktop)
- 768px (tablet)
- 480px (mobile)

---

## 🎨 Design System

### Color Palette

- **Primary**: `#667eea` → `#764ba2` (gradient)
- **Success**: `#10b981`
- **Warning**: `#f59e0b`
- **Danger**: `#ef4444`
- **Info**: `#3b82f6`
- **Background**: `#0f172a` (dark theme)
- **Text**: `#f1f5f9`

### Typography

- **Font**: Segoe UI, system fonts
- **Headings**: 700 weight, tight line-height
- **Body**: 400-600 weight, relaxed line-height

### Component Patterns

- Card: elevation + hover effects
- Button: gradient, smooth transitions
- Alert: colored left border
- Progress: gradient fill with animation

---

## 🎓 Viva Explanation (Interview Guide)

### Question 1: "Explain the application architecture"

**Answer Structure:**

```
NeuroWell follows a layered modular architecture:

1. UI LAYER: HTML/CSS for presentation
   - 4 main pages using shared components
   - Responsive design with dark theme SaaS style

2. PRESENTATION LAYER: Page Managers
   - AssessmentManager: Handles multi-step form
   - DashboardManager: Renders visualizations
   - RecommendationsPageManager: Displays insights

3. BUSINESS LOGIC LAYER: Engines
   - ScoringEngine: Weighted wellness calculation
   - PredictionEngine: Burnout risk & trends
   - RecommendationEngine: Rule-based AI

4. DATA LAYER: Storage
   - StorageManager: localStorage CRUD
   - No backend/server needed

Benefits:
- Clean separation of concerns
- Easy to test & maintain
- Scalable to add features
- Reusable components
```

### Question 2: "How does the scoring algorithm work?"

**Answer Structure:**

```
The scoring uses a weighted formula approach:

STEP 1: Normalize Questions
- Each 1-5 response → 0-100 scale
- Negative impact questions inverted
- Formula: (response/5) × 100

STEP 2: Category Averaging
- Apply question weights (1.5-2.2)
- Weighted average per category
- Physical, Mental, Emotional scores

STEP 3: Overall Score
- Weighted blend: Physical(35%) + Mental(35%) + Emotional(30%)
- Represents overall wellness (0-100)

STEP 4: Burnout Risk
- Inverse of mental/physical/emotional scores
- Higher risk = lower wellness
- Risk levels: Low(0-30), Moderate(31-60), High(61-100)

Example:
- User answers all questions with "3/5" average
- Normalized = 60 points per category
- Overall = 60 (balanced wellness)
- Burnout = moderate risk
```

### Question 3: "How are recommendations generated?"

**Answer Structure:**

```
Rule-Based Recommendation Engine:

1. RULE DATABASE (rules.js)
   - 10+ predefined rules
   - Each rule has: condition, title, recommendations

2. EVALUATION PROCESS
   - Check each rule's condition against scores
   - Rule triggers if condition matches
   - Examples:
     * IF mental < 40 → Stress Management rule
     * IF burnout_risk > 70 → Seek Professional Help
     * IF overall >= 80 → Maintain Habits

3. PRIORITIZATION
   - Sort by priority: CRITICAL > HIGH > MEDIUM > LOW
   - Display top 5 per priority level

4. PERSONALIZATION
   - Each rule contains 3-5 specific recommendations
   - Tailored to user's specific low scores
   - Actionable items included

NOT Machine Learning:
- Uses deterministic condition matching
- No training data or neural networks
- Explicit rules defined by domain experts
```

### Question 4: "What makes this production-ready?"

**Answer Structure:**

```
Professional Features:

1. CODE QUALITY
   - Modular architecture (not spaghetti code)
   - Clear separation of concerns
   - Comprehensive comments for viva
   - Consistent naming conventions

2. ERROR HANDLING
   - Try-catch blocks for safety
   - Graceful degradation
   - User-friendly error messages
   - Console logging for debugging

3. PERFORMANCE
   - No unnecessary re-renders
   - Efficient DOM manipulation
   - localStorage caching
   - Smooth animations (300ms)

4. UX/DESIGN
   - Professional dark theme
   - Responsive mobile-first
   - Smooth transitions
   - Loading indicators
   - Clear visual hierarchy

5. DATA MANAGEMENT
   - Persistent storage (localStorage)
   - Data export capability
   - Historical tracking (12-month rolling)
   - Privacy-first approach

6. SCALABILITY
   - New rules: Add to RULES object
   - New questions: Add to QUESTIONS array
   - New pages: Create HTML + Manager
   - Easy to extend without breaking
```

### Question 5: "How does data persistence work?"

**Answer Structure:**

```
localStorage Implementation:

STORAGE STRUCTURE:
- assessment_responses: User's Q&A responses
- wellness_score: Latest calculated scores
- historical_data: Array of past scores (12 max)
- last_assessment_date: Timestamp

FLOW:
1. User completes assessment
2. Responses saved to localStorage
3. Scores calculated & saved
4. Added to historical data
5. On next visit: Load from localStorage
6. User can view past data, trends

ADVANTAGES:
- No backend needed
- Instant persistence
- Works offline
- 100% privacy
- ~5-10MB per browser

LIMITATIONS:
- Browser-dependent (not cloud)
- Cleared if user clears browser cache
- Size limited (~5MB)
- Solved by: Export feature (JSON backup)
```

### Question 6: "How would you extend this application?"

**Answer Structure:**

```
Scalability Plan:

SHORT TERM (Add features):
1. More questions: Modify QUESTIONS array
2. New rules: Add to RULES object
3. Different assessments: Create QUESTIONS_PRO
4. Progress photos: Store base64 in localStorage

MEDIUM TERM (Backend integration):
1. Create Node.js/Python backend
2. Add user authentication (JWT)
3. Cloud database (MongoDB/PostgreSQL)
4. API endpoints for CRUD
5. No changes needed to current JS logic

LONG TERM (Advanced features):
1. Machine learning predictions (TensorFlow.js)
2. Social features (share progress, groups)
3. Wearable integration (Apple Health, Fitbit)
4. Mobile app (React Native)
5. AI chatbot for support
6. Doctor/coach dashboard (B2B)

CURRENT ARCHITECTURE SUPPORTS THIS:
- Modular design: Easy to extend
- Separation of concerns: Add features independently
- localStorage can be swapped for API calls
- Engines can be replaced with ML models
```

---

## 🔍 Code Quality Metrics

- **Lines of Code**: ~2,500 (excluding comments)
- **Functions**: 50+
- **Modules**: 7 core modules
- **Components**: 3 reusable
- **Rules**: 10+ recommendation rules
- **Questions**: 15 assessment questions
- **Documentation**: Comprehensive inline comments

---

## 📝 Example User Journey

1. **User visits index.html**
   - Sees landing page with features
   - Clicks "Start Assessment"

2. **User completes assessment.html**
   - 5-step form, 15 questions
   - All answers saved automatically
   - Takes ~5-10 minutes

3. **System calculates scores**
   - Uses weighted scoring algorithm
   - Generates burnout risk percentage
   - Saves to localStorage

4. **User views dashboard.html**
   - Sees wellness score (72%)
   - Views category breakdown
   - Sees burnout risk gauge (45%)
   - Views trends in chart

5. **User views recommendations.html**
   - Gets 3 critical recommendations
   - Learns quick wins to try today
   - Gets 30-day wellness plan
   - Reviews checkpoints

6. **User tracks progress**
   - Retakes assessment in 7 days
   - Sees improvement (now 75%)
   - Follows recommendations
   - Exports data for personal records

---

## 🎯 Key Achievements

✅ **Professional UI/UX**: SaaS-level design with dark theme
✅ **Modular Architecture**: Clean separation of concerns
✅ **Advanced Scoring**: Weighted formula-based calculations
✅ **Predictive Analytics**: Burnout risk and trend prediction
✅ **Rule-Based AI**: 10+ recommendation rules
✅ **Full Responsiveness**: Works on all devices
✅ **Data Privacy**: 100% client-side storage
✅ **Production Ready**: Error handling, validation, documentation

---

## 📖 Quick Start Guide

### Installation

1. Download the project files
2. No build process needed
3. Open `index.html` in browser

### First Use

1. Click "Start Assessment"
2. Complete all 15 questions (5 steps)
3. View results on dashboard
4. Check recommendations
5. Follow the 30-day plan

### Data Management

- Data auto-saves during assessment
- View exported data: Dashboard → Export button
- Reset data: Navigation → Reset button
- Historical data kept for 12 assessments

---

## 🤝 Contributing

To add new features:

1. **New Question**: Edit `data/questions.js`
2. **New Rule**: Edit `data/rules.js`
3. **New Page**: Create HTML + Manager in `js/`
4. **New Style**: Add to appropriate CSS file
5. **Test**: Open page and verify functionality

---

## 📄 License & Credits

- Developed as a demonstration of professional web application development
- All code written in ES6+ vanilla JavaScript
- No external dependencies except Chart.js (included)
- Educational project showcasing modern web best practices

---

**Version**: 1.0.0  
**Last Updated**: April 2024  
**Status**: Production Ready ✅
