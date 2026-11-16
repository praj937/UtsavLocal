const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all pending events for moderation
// @route   GET /api/admin/events/pending
// @access  Protected (Admin only)
const getPendingEvents = async (req, res, next) => {
  try {
    const pendingEvents = await Event.find({ status: 'pending' })
      .populate('organizerId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingEvents.length,
      data: pendingEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event status (approve or reject)
// @route   PATCH /api/admin/events/:id/status
// @access  Protected (Admin only)
const updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted values: approved, rejected, pending',
      });
    }

    const event = await Event.findById(req.params.id).populate(
      'organizerId',
      'name email'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = status;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event has been successfully ${status}`,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall admin stats for the dashboard overview
// @route   GET /api/admin/stats
// @access  Protected (Admin only)
const getAdminStats = async (req, res, next) => {
  try {
    const [totalApproved, totalPending, totalRejected, totalUsers, totalOrganizers] =
      await Promise.all([
        Event.countDocuments({ status: 'approved' }),
        Event.countDocuments({ status: 'pending' }),
        Event.countDocuments({ status: 'rejected' }),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'organizer' }),
      ]);

    const aggregateRsvps = await Event.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalRsvps: { $sum: '$attendeesCount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalApproved,
        totalPending,
        totalRejected,
        totalUsers,
        totalOrganizers,
        totalRsvps: aggregateRsvps[0] ? aggregateRsvps[0].totalRsvps : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingEvents,
  updateEventStatus,
  getAdminStats,
};
