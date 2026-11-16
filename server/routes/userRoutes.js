const express = require('express');
const router = express.Router();
const {
  toggleSaveEvent,
  toggleRsvpEvent,
  getUserDashboard,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user interaction routes are protected
router.use(protect);

router.post('/save/:eventId', toggleSaveEvent);
router.post('/rsvp/:eventId', toggleRsvpEvent);
router.get('/dashboard', getUserDashboard);

module.exports = router;
