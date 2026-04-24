const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  // Appointment details
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },

  time: {
    type: String,
    required: [true, 'Appointment time is required'],
    enum: {
      values: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
      message: 'Invalid time slot. Available: 9:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00'
    }
  },

  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['mental_health', 'fitness_coaching', 'nutrition_consultation', 'stress_management', 'wellness_check'],
      message: 'Invalid appointment type'
    }
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Additional details
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },

  // Contact information (for non-registered users)
  contactInfo: {
    name: String,
    email: String,
    phone: String
  },

  // Admin notes
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for formatted date/time
appointmentSchema.virtual('formattedDateTime').get(function() {
  const dateStr = this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return `${dateStr} at ${this.time}`;
});

// Virtual for duration (assuming 1 hour sessions)
appointmentSchema.virtual('duration').get(function() {
  return 60; // minutes
});

// Instance method to check if appointment can be cancelled
appointmentSchema.methods.canCancel = function() {
  const now = new Date();
  const appointmentTime = new Date(this.date);
  const timeString = this.time.split(':');
  appointmentTime.setHours(parseInt(timeString[0]), parseInt(timeString[1]));

  // Can cancel up to 24 hours before appointment
  const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

  return appointmentTime > twentyFourHoursFromNow && this.status === 'pending';
};

// Instance method to check if appointment can be rescheduled
appointmentSchema.methods.canReschedule = function() {
  return this.status === 'pending' && this.canCancel();
};

// Static method to check availability
appointmentSchema.statics.checkAvailability = async function(date, time) {
  const count = await this.countDocuments({
    date: new Date(date),
    time: time,
    status: { $in: ['pending', 'confirmed'] }
  });

  return count === 0; // Available if no appointments at this time
};

// Static method to get available time slots for a date
appointmentSchema.statics.getAvailableSlots = async function(date) {
  const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const bookedSlots = await this.find({
    date: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  }).select('time');

  const bookedTimes = bookedSlots.map(slot => slot.time);
  return allSlots.filter(slot => !bookedTimes.includes(slot));
};

// Pre-save middleware to check for conflicts
appointmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('time')) {
    const isAvailable = await this.constructor.checkAvailability(this.date, this.time);
    if (!isAvailable) {
      return next(new Error('Time slot is not available'));
    }
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);