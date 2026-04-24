/**
 * NEUROWELL BACKEND - Assessment Model
 * MongoDB schema for storing wellness assessment data
 * Includes responses, calculated scores, recommendations, and risk assessment
 */

const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  // User assessment responses
  responses: {
    type: [{
      question_id: {
        type: String,
        required: true
      },
      value: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
    }],
    required: true,
    validate: {
      validator: function(responses) {
        return responses && responses.length > 0;
      },
      message: 'At least one response is required'
    }
  },

  // Calculated scores
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // Category breakdown scores
  categoryScores: {
    physical: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    mental: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    emotional: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },

  // Generated recommendations
  recommendations: {
    type: [{
      id: String,
      category: String,
      priority: {
        type: String,
        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
      },
      title: String,
      recommendations: [String],
      actions: [String]
    }],
    required: true
  },

  // Burnout risk percentage
  risk: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Optional user identifier (for future authentication)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Assessment metadata
  version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for performance
AssessmentSchema.index({ createdAt: -1 });
AssessmentSchema.index({ userId: 1, createdAt: -1 });

// Virtual for score status
AssessmentSchema.virtual('scoreStatus').get(function() {
  const score = this.score;
  if (score >= 80) return { label: 'Excellent', color: 'success' };
  if (score >= 60) return { label: 'Good', color: 'info' };
  if (score >= 40) return { label: 'Fair', color: 'warning' };
  return { label: 'Poor', color: 'danger' };
});

// Virtual for risk level
AssessmentSchema.virtual('riskLevel').get(function() {
  const risk = this.risk;
  if (risk >= 70) return 'CRITICAL';
  if (risk >= 50) return 'HIGH';
  if (risk >= 30) return 'MODERATE';
  return 'LOW';
});

// Instance method to get summary
AssessmentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    score: this.score,
    scoreStatus: this.scoreStatus,
    categoryScores: this.categoryScores,
    risk: this.risk,
    riskLevel: this.riskLevel,
    recommendationsCount: this.recommendations.length,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Assessment', AssessmentSchema);