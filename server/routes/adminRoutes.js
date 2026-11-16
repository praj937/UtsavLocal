const express = require('express');
const router = express.Router();
const {
  getPendingEvents,
  updateEventStatus,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/events/pending', getPendingEvents);
router.patch('/events/:id/status', updateEventStatus);
router.get('/stats', getAdminStats);

module.exports = router;
