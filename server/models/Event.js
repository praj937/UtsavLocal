const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Cultural Festival',
          'Workshop',
          'Music & Arts',
          'Food & Bazaar',
          'Community Drive',
          'Sports',
        ],
        message: '{VALUE} is not a supported event category',
      },
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Please specify the event date'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Please specify the start time (e.g. 10:00 AM)'],
    },
    endTime: {
      type: String,
      required: [true, 'Please specify the end time (e.g. 01:00 PM)'],
    },
    venueName: {
      type: String,
      required: [true, 'Please provide the venue or landmark name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide the street address'],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'Please specify the neighborhood (e.g., Malleshwaram, Indiranagar)'],
      trim: true,
      index: true,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, 'Ticket price cannot be negative'],
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event must have an organizer'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    attendeesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for high performance querying
eventSchema.index({ status: 1, date: 1, neighborhood: 1, category: 1 });
eventSchema.index({ title: 'text', description: 'text', neighborhood: 'text', venueName: 'text' });

module.exports = mongoose.model('Event', eventSchema);
