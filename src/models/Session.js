const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to ensure unique date+time per phone
sessionSchema.index({ phone: 1, date: 1, time: 1 });

module.exports = mongoose.model('Session', sessionSchema);
