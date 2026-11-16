const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Toggle bookmark/save event for logged-in user
// @route   POST /api/users/save/:eventId
// @access  Protected
const toggleSaveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const user = await User.findById(req.user._id);
    const isSaved = user.savedEvents.some(
      (id) => id.toString() === eventId.toString()
    );

    if (isSaved) {
      // Remove from savedEvents
      user.savedEvents = user.savedEvents.filter(
        (id) => id.toString() !== eventId.toString()
      );
      await user.save();
      return res.status(200).json({
        success: true,
        isSaved: false,
        message: 'Event removed from your saved bookmarks',
        savedEvents: user.savedEvents,
      });
    } else {
      // Add to savedEvents
      user.savedEvents.push(eventId);
      await user.save();
      return res.status(200).json({
        success: true,
        isSaved: true,
        message: 'Event saved to your bookmarks!',
        savedEvents: user.savedEvents,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle RSVP ("Going") and atomically increment/decrement attendeesCount
// @route   POST /api/users/rsvp/:eventId
// @access  Protected
const toggleRsvpEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const user = await User.findById(req.user._id);
    const isRsvped = user.rsvpedEvents.some(
      (id) => id.toString() === eventId.toString()
    );

    if (isRsvped) {
      // Cancel RSVP: Remove from user's rsvpedEvents and decrement event.attendeesCount
      user.rsvpedEvents = user.rsvpedEvents.filter(
        (id) => id.toString() !== eventId.toString()
      );
      await user.save();

      // Atomic decrement, ensuring minimum 0
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { attendeesCount: -1 } },
        { new: true }
      );
      if (updatedEvent.attendeesCount < 0) {
        updatedEvent.attendeesCount = 0;
        await updatedEvent.save();
      }

      return res.status(200).json({
        success: true,
        isRsvped: false,
        message: 'RSVP cancelled successfully',
        attendeesCount: updatedEvent.attendeesCount,
        rsvpedEvents: user.rsvpedEvents,
      });
    } else {
      // Confirm RSVP: Add to user's rsvpedEvents and increment event.attendeesCount
      user.rsvpedEvents.push(eventId);
      await user.save();

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { attendeesCount: 1 } },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        isRsvped: true,
        message: 'RSVP confirmed! See you at the event!',
        attendeesCount: updatedEvent.attendeesCount,
        rsvpedEvents: user.rsvpedEvents,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's dashboard (saved events, RSVPed events, and organizer events)
// @route   GET /api/users/dashboard
// @access  Protected
const getUserDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedEvents',
        populate: { path: 'organizerId', select: 'name email' },
      })
      .populate({
        path: 'rsvpedEvents',
        populate: { path: 'organizerId', select: 'name email' },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Filter out null references if any events were deleted
    const validSavedEvents = (user.savedEvents || []).filter(Boolean);
    const validRsvpedEvents = (user.rsvpedEvents || []).filter(Boolean);

    let submittedEvents = [];
    if (req.user.role === 'organizer' || req.user.role === 'admin') {
      submittedEvents = await Event.find({ organizerId: req.user._id })
        .populate('organizerId', 'name email')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        savedEvents: validSavedEvents,
        rsvpedEvents: validRsvpedEvents,
        submittedEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleSaveEvent,
  toggleRsvpEvent,
  getUserDashboard,
};
