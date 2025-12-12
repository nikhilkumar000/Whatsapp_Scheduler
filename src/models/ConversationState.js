const mongoose = require('mongoose');

const conversationStateSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  step: {
    type: String,
    required: true,
    enum: ['NONE', 'ASK_DATE', 'ASK_TIME'],
    default: 'NONE',
  },
  tempDate: {
    type: String,
    default: null,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update the updatedAt field on save
conversationStateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ConversationState', conversationStateSchema);
