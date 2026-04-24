const Appointment = require('../models/Appointment');
const { body, validationResult } = require('express-validator');

/**
 * Create new appointment
 * POST /api/appointments
 */
const createAppointment = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, time, type, notes } = req.body;
    const userId = req.user._id;

    // Check if time slot is available
    const isAvailable = await Appointment.checkAvailability(date, time);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Selected time slot is not available'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId,
      date,
      time,
      type,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment: {
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
          formattedDateTime: appointment.formattedDateTime,
          canCancel: appointment.canCancel(),
          canReschedule: appointment.canReschedule()
        }
      }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    next(error);
  }
};

/**
 * Get user's appointments
 * GET /api/appointments
 */
const getUserAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: {
        appointments: appointments.map(apt => ({
          id: apt._id,
          date: apt.date,
          time: apt.time,
          type: apt.type,
          status: apt.status,
          notes: apt.notes,
          formattedDateTime: apt.formattedDateTime,
          canCancel: apt.canCancel(),
          canReschedule: apt.canReschedule(),
          createdAt: apt.createdAt
        }))
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    next(error);
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: {
        appointment: {
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
          adminNotes: appointment.adminNotes,
          formattedDateTime: appointment.formattedDateTime,
          canCancel: appointment.canCancel(),
          canReschedule: appointment.canReschedule(),
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    next(error);
  }
};

/**
 * Update appointment
 * PUT /api/appointments/:id
 */
const updateAppointment = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { date, time, type, notes } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if can reschedule
    if ((date || time) && !appointment.canReschedule()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reschedule this appointment'
      });
    }

    // Check availability for new time slot
    if (date || time) {
      const newDate = date || appointment.date;
      const newTime = time || appointment.time;

      if (newDate.getTime() !== appointment.date.getTime() || newTime !== appointment.time) {
        const isAvailable = await Appointment.checkAvailability(newDate, newTime);
        if (!isAvailable) {
          return res.status(409).json({
            success: false,
            message: 'New time slot is not available'
          });
        }
      }
    }

    // Update appointment
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (type) appointment.type = type;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: {
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
          formattedDateTime: appointment.formattedDateTime,
          canCancel: appointment.canCancel(),
          canReschedule: appointment.canReschedule()
        }
      }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    next(error);
  }
};

/**
 * Cancel appointment
 * DELETE /api/appointments/:id
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!appointment.canCancel()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    next(error);
  }
};

/**
 * Get available time slots for a date
 * GET /api/appointments/availability
 */
const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const availableSlots = await Appointment.getAvailableSlots(date);

    res.json({
      success: true,
      data: {
        date,
        availableSlots
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    next(error);
  }
};

module.exports = {
  createAppointment,
  getUserAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailability
};