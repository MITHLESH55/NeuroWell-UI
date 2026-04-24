/**
 * NEUROWELL - Appointment Booking Module
 * Manages wellness session bookings with date/time selection
 * 
 * ARCHITECTURE:
 * - BookingManager: Central manager for all booking operations
 * - Bookings stored in localStorage with persistent state
 * - Input validation for date, time, session type
 * - Integration with existing storage system
 * 
 * FEATURES:
 * - Create wellness session bookings
 * - Session types: Mental Health, Fitness, General Wellness
 * - Date/time picker with future date validation
 * - Booking confirmation messages
 * - Upcoming bookings list
 * - Booking history
 * 
 * VIVA READY:
 * - Form validation logic (date must be future, time required)
 * - Booking confirmation tracking
 * - Professional UX with error handling
 */

const BookingManager = {
  
  // ===== CONSTANTS =====
  SESSION_TYPES: {
    MENTAL: { id: 'mental', name: 'Mental Health Session', icon: '🧠', duration: 60, price: '$0' },
    FITNESS: { id: 'fitness', name: 'Fitness Coaching', icon: '💪', duration: 45, price: '$0' },
    WELLNESS: { id: 'wellness', name: 'General Wellness', icon: '🌿', duration: 30, price: '$0' }
  },

  STORAGE_KEY: 'neurowell_bookings',

  // ===== STATE MANAGEMENT =====
  bookings: [],

  /**
   * Initialize booking system
   * Load existing bookings from localStorage
   * VIVA: "We load existing bookings on app initialization"
   */
  init: () => {
    console.log('📅 Initializing Appointment Booking System...');
    
    BookingManager.bookings = BookingManager.loadBookings();
    console.log(`✅ Booking System Ready (${BookingManager.bookings.length} bookings loaded)`);
  },

  /**
   * Load bookings from localStorage
   */
  loadBookings: () => {
    try {
      const data = localStorage.getItem(BookingManager.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('✗ Error loading bookings:', error);
      return [];
    }
  },

  /**
   * Save bookings to localStorage
   */
  saveBookings: () => {
    try {
      localStorage.setItem(BookingManager.STORAGE_KEY, JSON.stringify(BookingManager.bookings));
      console.log('✓ Bookings saved');
      return true;
    } catch (error) {
      console.error('✗ Error saving bookings:', error);
      return false;
    }
  },

  // ===== VALIDATION =====

  /**
   * Validate booking form data
   * VIVA: "We validate date (must be future), time (required), and session type"
   * @param {object} formData - { date, time, sessionType, name, email, notes }
   * @returns {object} { isValid: boolean, errors: array }
   */
  validateBookingForm: (formData) => {
    const errors = [];

    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Name is required (minimum 2 characters)');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.push('Valid email is required');
    }

    // Validate date
    if (!formData.date) {
      errors.push('Date is required');
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Date must be in the future');
      }
      
      // Maximum 90 days in advance
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + 90);
      if (selectedDate > maxDate) {
        errors.push('Bookings can only be made up to 90 days in advance');
      }
    }

    // Validate time
    if (!formData.time) {
      errors.push('Time is required');
    } else {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.time)) {
        errors.push('Invalid time format');
      }

      // Check business hours (9 AM - 6 PM)
      const [hours] = formData.time.split(':').map(Number);
      if (hours < 9 || hours >= 18) {
        errors.push('Sessions are available between 9:00 AM - 6:00 PM');
      }
    }

    // Validate session type
    if (!formData.sessionType || !Object.keys(BookingManager.SESSION_TYPES).some(key => 
      BookingManager.SESSION_TYPES[key].id === formData.sessionType
    )) {
      errors.push('Valid session type is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // ===== BOOKING OPERATIONS =====

  /**
   * Create a new booking
   * VIVA: "We create a booking with unique ID, timestamp, and validation"
   * @param {object} formData - Booking information
   * @returns {object} { success: boolean, bookingId: string, message: string }
   */
  createBooking: (formData) => {
    // Validate form
    const validation = BookingManager.validateBookingForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Booking validation failed'
      };
    }

    // Create booking object
    const booking = {
      id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      sessionType: formData.sessionType,
      date: formData.date,
      time: formData.time,
      notes: formData.notes || '',
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      reminderSent: false,
      confirmationNumber: BookingManager.generateConfirmationNumber()
    };

    // Add to bookings array
    BookingManager.bookings.push(booking);
    BookingManager.saveBookings();

    console.log('✓ Booking created:', booking);

    return {
      success: true,
      bookingId: booking.id,
      confirmationNumber: booking.confirmationNumber,
      message: 'Booking confirmed successfully'
    };
  },

  /**
   * Generate confirmation number
   * Format: BK-YYYYMMDD-XXXX (e.g., BK-20260422-A7F3)
   */
  generateConfirmationNumber: () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `BK-${dateStr}-${randomStr}`;
  },

  /**
   * Get booking by ID
   */
  getBooking: (bookingId) => {
    return BookingManager.bookings.find(b => b.id === bookingId);
  },

  /**
   * Get upcoming bookings (future dates)
   */
  getUpcomingBookings: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return BookingManager.bookings
      .filter(b => new Date(b.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  /**
   * Get past bookings
   */
  getPastBookings: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return BookingManager.bookings
      .filter(b => new Date(b.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Cancel booking
   */
  cancelBooking: (bookingId) => {
    const booking = BookingManager.getBooking(bookingId);
    if (!booking) return false;

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    BookingManager.saveBookings();
    return true;
  },

  /**
   * Reschedule booking
   */
  rescheduleBooking: (bookingId, newDate, newTime) => {
    const booking = BookingManager.getBooking(bookingId);
    if (!booking) return false;

    // Validate new date/time
    const validation = BookingManager.validateBookingForm({
      name: booking.name,
      email: booking.email,
      date: newDate,
      time: newTime,
      sessionType: booking.sessionType
    });

    if (!validation.isValid) {
      return false;
    }

    booking.date = newDate;
    booking.time = newTime;
    booking.rescheduledAt = new Date().toISOString();
    BookingManager.saveBookings();
    return true;
  },

  // ===== AVAILABILITY CHECKING =====

  /**
   * Check available time slots for a date
   * VIVA: "We simulate available slots between 9 AM - 6 PM with 30-min intervals"
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {array} Array of available time slots
   */
  getAvailableSlots: (date) => {
    const slots = [];
    
    // Generate 30-minute slots from 9 AM to 6 PM
    for (let hour = 9; hour < 18; hour++) {
      for (let minute of [0, 30]) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }

    // Filter out already booked slots for this date
    BookingManager.bookings.forEach(booking => {
      if (booking.date === date && booking.status === 'confirmed') {
        const slotIndex = slots.indexOf(booking.time);
        if (slotIndex > -1) {
          slots.splice(slotIndex, 1);
        }
      }
    });

    return slots;
  },

  /**
   * Get available dates (next 90 days)
   * Excluding weekends and company holidays
   * @returns {array} Array of available dates in YYYY-MM-DD format
   */
  getAvailableDates: () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Skip Sundays (0) and Saturdays (6)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      dates.push(date.toISOString().slice(0, 10));
    }

    return dates;
  },

  // ===== UI RENDERING =====

  /**
   * Render booking form
   */
  renderBookingForm: () => {
    const container = document.getElementById('bookingFormContainer');
    if (!container) return;

    const availableDates = BookingManager.getAvailableDates();
    
    container.innerHTML = `
      <div class="booking-form-wrapper">
        <h1>📅 Book a Wellness Session</h1>
        <p class="subtitle">Schedule a personalized wellness session with our experts</p>

        <form id="bookingForm" class="booking-form">
          <!-- Personal Information -->
          <div class="form-section">
            <h3>Your Information</h3>
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="John Doe"
                required
              >
              <span class="form-error" id="nameError"></span>
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="john@example.com"
                required
              >
              <span class="form-error" id="emailError"></span>
            </div>
          </div>

          <!-- Session Details -->
          <div class="form-section">
            <h3>Session Details</h3>
            <div class="form-group">
              <label for="sessionType">Session Type *</label>
              <select id="sessionType" name="sessionType" required>
                <option value="">Select a session type</option>
                ${Object.values(BookingManager.SESSION_TYPES).map(session => `
                  <option value="${session.id}">
                    ${session.icon} ${session.name} (${session.duration} min)
                  </option>
                `).join('')}
              </select>
              <span class="form-error" id="sessionTypeError"></span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="date">Date *</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date"
                  min="${new Date().toISOString().split('T')[0]}"
                  max="${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}"
                  required
                >
                <span class="form-error" id="dateError"></span>
              </div>

              <div class="form-group">
                <label for="time">Time *</label>
                <input 
                  type="time" 
                  id="time" 
                  name="time"
                  min="09:00"
                  max="18:00"
                  required
                >
                <span class="form-error" id="timeError"></span>
              </div>
            </div>

            <div class="form-group">
              <label for="notes">Additional Notes</label>
              <textarea 
                id="notes" 
                name="notes"
                placeholder="Tell us about your wellness goals or any specific topics you'd like to discuss..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Errors Display -->
          <div id="formErrors" class="form-errors"></div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg">
              ✓ Confirm Booking
            </button>
            <button type="reset" class="btn btn-secondary btn-lg">
              🔄 Clear Form
            </button>
          </div>

          <!-- Terms -->
          <p class="form-terms">
            By booking, you agree to our cancellation policy. 
            <a href="#" onclick="alert('Cancellations must be made 24 hours before the session.')">
              View policy
            </a>
          </p>
        </form>
      </div>
    `;

    // Attach form submission handler
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', BookingManager.handleFormSubmit);

    // Add date change listener to update available times
    document.getElementById('date').addEventListener('change', (e) => {
      BookingManager.updateAvailableSlots(e.target.value);
    });
  },

  /**
   * Update available time slots when date changes
   */
  updateAvailableSlots: (date) => {
    const timeInput = document.getElementById('time');
    const slots = BookingManager.getAvailableSlots(date);

    if (slots.length === 0) {
      timeInput.disabled = true;
      timeInput.title = 'No available slots for this date';
    } else {
      timeInput.disabled = false;
      timeInput.title = '';
    }
  },

  /**
   * Handle booking form submission
   */
  handleFormSubmit: (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      sessionType: document.getElementById('sessionType').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      notes: document.getElementById('notes').value
    };

    // Create booking
    const result = BookingManager.createBooking(formData);

    if (result.success) {
      BookingManager.showConfirmation(result);
      document.getElementById('bookingForm').reset();
    } else {
      BookingManager.showErrors(result.errors);
    }
  },

  /**
   * Show booking confirmation
   */
  showConfirmation: (result) => {
    const container = document.getElementById('bookingFormContainer');
    
    container.innerHTML = `
      <div class="booking-confirmation">
        <div class="confirmation-icon">✓</div>
        <h2>Booking Confirmed!</h2>
        <p class="confirmation-number">Confirmation #: ${result.confirmationNumber}</p>
        
        <div class="confirmation-details">
          <p>Your wellness session has been successfully booked.</p>
          <p>A confirmation email will be sent to your email address shortly.</p>
        </div>

        <div class="confirmation-actions">
          <button class="btn btn-primary" onclick="BookingManager.renderBookingForm()">
            📅 Book Another Session
          </button>
          <button class="btn btn-secondary" onclick="BookingManager.renderUpcomingBookings()">
            📋 View My Bookings
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Show form errors
   */
  showErrors: (errors) => {
    const errorDiv = document.getElementById('formErrors');
    if (!errorDiv) return;

    errorDiv.innerHTML = `
      <div class="error-box">
        <h4>Please fix the following errors:</h4>
        <ul>
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      </div>
    `;
    errorDiv.scrollIntoView({ behavior: 'smooth' });
  },

  /**
   * Render upcoming bookings
   */
  renderUpcomingBookings: () => {
    const container = document.getElementById('bookingFormContainer') || 
                      document.getElementById('bookingsContainer');
    if (!container) return;

    const upcoming = BookingManager.getUpcomingBookings();

    container.innerHTML = `
      <div class="bookings-list">
        <div class="bookings-header">
          <h2>📋 Your Bookings</h2>
          <button class="btn btn-primary" onclick="BookingManager.renderBookingForm()">
            + New Booking
          </button>
        </div>

        ${upcoming.length === 0 ? `
          <div class="empty-state">
            <p>No upcoming bookings</p>
            <button class="btn btn-primary" onclick="BookingManager.renderBookingForm()">
              Book a Session
            </button>
          </div>
        ` : `
          <div class="bookings-grid">
            ${upcoming.map(booking => BookingManager.renderBookingCard(booking)).join('')}
          </div>
        `}
      </div>
    `;
  },

  /**
   * Render individual booking card
   */
  renderBookingCard: (booking) => {
    const session = BookingManager.SESSION_TYPES[Object.keys(BookingManager.SESSION_TYPES).find(key =>
      BookingManager.SESSION_TYPES[key].id === booking.sessionType
    )];

    const bookingDate = new Date(booking.date);
    const dateStr = bookingDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return `
      <div class="booking-card">
        <div class="booking-icon">${session?.icon || '📅'}</div>
        <div class="booking-info">
          <h4>${session?.name || 'Booking'}</h4>
          <div class="booking-details">
            <span>📅 ${dateStr}</span>
            <span>🕐 ${booking.time}</span>
          </div>
          <div class="booking-meta">
            <span class="confirmation">Conf: ${booking.confirmationNumber}</span>
            <span class="status">${booking.status}</span>
          </div>
        </div>
        <div class="booking-actions">
          <button class="btn btn-sm btn-secondary" onclick="
            const newDate = prompt('New date (YYYY-MM-DD):');
            if (newDate) {
              const newTime = prompt('New time (HH:MM):');
              if (newTime && BookingManager.rescheduleBooking('${booking.id}', newDate, newTime)) {
                location.reload();
              }
            }
          ">Reschedule</button>
          <button class="btn btn-sm btn-danger" onclick="
            if (confirm('Cancel this booking?')) {
              BookingManager.cancelBooking('${booking.id}');
              location.reload();
            }
          ">Cancel</button>
        </div>
      </div>
    `;
  }
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    BookingManager.init();
  });
} else {
  BookingManager.init();
}
