# NeuroWell Backend API

## 📋 Overview

Professional Node.js backend for the NeuroWell AI-Driven Predictive Wellness Intelligence Platform. Built with Express.js, MongoDB, and a modular architecture that seamlessly integrates with the frontend.

## 🏗️ Architecture

```
backend/
├── server.js          # Entry point & server startup
├── app.js             # Express app configuration
├── config/
│   └── db.js          # MongoDB connection
├── routes/
│   └── assessmentRoutes.js  # API route definitions
├── controllers/
│   └── assessmentController.js  # Request handlers
├── services/          # Business logic
│   ├── scoringService.js
│   ├── recommendationService.js
│   └── predictionService.js
├── models/
│   └── Assessment.js  # MongoDB schema
├── middleware/
│   └── errorHandler.js # Global error handling
├── data/              # Static data
│   ├── questions.js
│   └── rules.js
└── utils/
    └── helpers.js     # Utility functions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI
   ```

3. **Start MongoDB:**

   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   ```

4. **Start the server:**
   ```bash
   npm start          # Production
   npm run dev        # Development (with nodemon)
   ```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### POST /api/assessment

Create a new wellness assessment.

**Request Body:**

```json
{
  "responses": [
    { "question_id": "1", "value": 4 },
    { "question_id": "2", "value": 3 }
  ],
  "userId": "optional_user_id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "assessment_id",
    "score": 72,
    "categoryScores": {
      "physical": 75,
      "mental": 68,
      "emotional": 73
    },
    "recommendations": [...],
    "risk": 28
  }
}
```

### GET /api/assessment/:id

Retrieve a specific assessment with predictions and analysis.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "assessment_id",
    "score": 72,
    "categoryScores": {...},
    "recommendations": [...],
    "risk": 28,
    "predictions": {...},
    "riskAnalysis": {...},
    "wellnessPlan": {...},
    "quickWins": [...]
  }
}
```

## 🔧 Configuration

### Environment Variables (.env)

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/neurowell
```

### MongoDB Setup

**Local MongoDB:**

```bash
brew install mongodb-community  # macOS
sudo apt install mongodb        # Ubuntu
```

**MongoDB Atlas (Cloud):**

1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env

## 🧮 Business Logic

### Scoring Algorithm

- **Weighted Categories:** Physical (35%), Mental (35%), Emotional (30%)
- **Impact Types:** Positive (sleep, exercise) vs Negative (stress)
- **Normalization:** 1-5 scale → 0-100 score

### Recommendation Engine

- **Rule-Based:** 10+ deterministic rules
- **Priority Levels:** CRITICAL → HIGH → MEDIUM → LOW
- **Personalized:** Based on specific score thresholds

### Prediction Service

- **Burnout Risk:** Inverse relationship with wellness scores
- **Trajectory:** 30-day predictions using velocity calculations
- **Risk Analysis:** Early warning signals and protective factors

## 🔗 Frontend Integration

### CORS Configuration

Backend allows requests from `http://localhost:8080` (frontend).

### API Usage Example

```javascript
// Submit assessment
const response = await fetch("http://localhost:3000/api/assessment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    responses: [
      { question_id: "1", value: 4 },
      { question_id: "2", value: 3 },
    ],
  }),
});

const result = await response.json();
console.log("Score:", result.data.score);
console.log("Recommendations:", result.data.recommendations);
```

### Data Flow

```
Frontend Form → API POST → Scoring → Recommendations → Database → Response → Frontend Display
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Create assessment
curl -X POST http://localhost:3000/api/assessment \
  -H "Content-Type: application/json" \
  -d '{"responses":[{"question_id":"1","value":4}]}'
```

### Automated Testing

```bash
npm test
```

## 📊 Database Schema

### Assessment Collection

```javascript
{
  responses: Array,
  score: Number,           // 0-100
  categoryScores: {
    physical: Number,      // 0-100
    mental: Number,        // 0-100
    emotional: Number      // 0-100
  },
  recommendations: Array,
  risk: Number,            // 0-100 burnout risk
  userId: String,          // Optional
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **Helmet.js:** Security headers
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **CORS:** Configured for frontend domain
- **Input Validation:** Request sanitization
- **Error Handling:** No sensitive data in responses

## 📈 Performance

- **Compression:** Response compression enabled
- **Database Indexing:** Optimized queries
- **Connection Pooling:** Efficient MongoDB connections
- **Caching:** Ready for Redis integration

## 🚀 Deployment

### Local Development

```bash
npm run dev  # With auto-restart
```

### Production

```bash
NODE_ENV=production npm start
```

### Docker (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed:**

- Check if MongoDB is running
- Verify connection string in .env
- Check network/firewall settings

**CORS Errors:**

- Verify FRONTEND_URL in .env matches frontend URL
- Check browser console for preflight errors

**Port Already in Use:**

- Change PORT in .env
- Kill process using the port

### Debug Mode

```bash
DEBUG=* npm start
```

## 📚 API Documentation

### Response Format

All responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object,      // Present on success
  "errors": array,     // Present on validation errors
  "timestamp": string
}
```

### Error Codes

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## 📄 License

MIT License - see LICENSE file for details.

---

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** April 2024
