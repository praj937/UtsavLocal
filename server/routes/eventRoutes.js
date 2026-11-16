const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public route to fetch approved events
router.get('/', getEvents);

// Public route to get single event detail
router.get('/:id', getEventById);

// Protected route to create event (organizer or admin)
router.post('/', protect, authorizeRoles('organizer', 'admin'), createEvent);

// Protected route to edit event (owner organizer or admin)
router.put('/:id', protect, authorizeRoles('organizer', 'admin'), updateEvent);

// Protected route to delete event (owner organizer or admin)
router.delete('/:id', protect, authorizeRoles('organizer', 'admin'), deleteEvent);

module.exports = router;
