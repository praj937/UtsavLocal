const Event = require('../models/Event');
const User = require('../models/User');

// Helper to calculate weekend date range (Saturday to Sunday)
const getWeekendRange = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday

  let saturday = new Date(now);
  let sunday = new Date(now);

  if (dayOfWeek === 6) {
    // Today is Saturday
    saturday.setHours(0, 0, 0, 0);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);
  } else if (dayOfWeek === 0) {
    // Today is Sunday: include Saturday of this weekend or from start of today till Sunday end
    saturday.setDate(now.getDate() - 1);
    saturday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);
  } else {
    // Monday to Friday: find upcoming Saturday
    const daysUntilSaturday = 6 - dayOfWeek;
    saturday.setDate(now.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);
    sunday.setDate(saturday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);
  }

  return { saturday, sunday };
};

// @desc    Get all approved events with rich query filters
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { search, category, neighborhood, isFree, timeframe } = req.query;

    const query = { status: 'approved' };

    // Search filter across title, description, neighborhood, or venueName
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { neighborhood: searchRegex },
        { venueName: searchRegex },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Neighborhood filter
    if (neighborhood && neighborhood !== 'All') {
      query.neighborhood = new RegExp(`^${neighborhood.trim()}$`, 'i');
    }

    // Free / Paid filter
    if (isFree !== undefined && isFree !== '') {
      query.isFree = isFree === 'true';
    }

    // Timeframe filter (weekend or upcoming)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (timeframe === 'weekend') {
      const { saturday, sunday } = getWeekendRange();
      query.date = { $gte: saturday, $lte: sunday };
    } else if (timeframe === 'upcoming') {
      query.date = { $gte: today };
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name email')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizerId',
      'name email role'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found with given ID',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Protected (organizer or admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueName,
      address,
      neighborhood,
      isFree,
      ticketPrice,
      bannerImage,
    } = req.body;

    // Check required fields
    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !startTime ||
      !endTime ||
      !venueName ||
      !address ||
      !neighborhood
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all mandatory event fields',
      });
    }

    // Admin-created events are auto-approved; organizer submissions start as pending
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const event = await Event.create({
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueName,
      address,
      neighborhood,
      isFree: isFree === true || isFree === 'true',
      ticketPrice: isFree === false || isFree === 'false' ? Number(ticketPrice || 0) : 0,
      bannerImage: bannerImage || undefined,
      organizerId: req.user._id,
      status,
    });

    res.status(201).json({
      success: true,
      message:
        status === 'approved'
          ? 'Event created and published immediately (Admin)'
          : 'Event submitted successfully! It is awaiting review by community moderators.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Protected (event organizer owner or admin)
const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership: user must be the organizer or admin
    if (
      event.organizerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only edit your own events',
      });
    }

    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      venueName,
      address,
      neighborhood,
      isFree,
      ticketPrice,
      bannerImage,
    } = req.body;

    // Update fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (venueName !== undefined) event.venueName = venueName;
    if (address !== undefined) event.address = address;
    if (neighborhood !== undefined) event.neighborhood = neighborhood;
    if (isFree !== undefined) {
      event.isFree = isFree === true || isFree === 'true';
      event.ticketPrice = event.isFree ? 0 : Number(ticketPrice || 0);
    }
    if (bannerImage !== undefined) event.bannerImage = bannerImage;

    // If an organizer edits an event that was previously rejected, reset status to pending for re-review
    if (req.user.role !== 'admin' && event.status === 'rejected') {
      event.status = 'pending';
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Protected (event organizer owner or admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership: user must be the organizer or admin
    if (
      event.organizerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only delete your own events',
      });
    }

    // Clean up references in User savedEvents and rsvpedEvents
    await User.updateMany(
      { $or: [{ savedEvents: event._id }, { rsvpedEvents: event._id }] },
      { $pull: { savedEvents: event._id, rsvpedEvents: event._id } }
    );

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
