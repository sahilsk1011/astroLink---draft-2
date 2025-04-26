// src/models/Astrologer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const astrologerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  handle: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  specialties: [{
    type: String,
    enum: ['Vedic', 'Western', 'Chinese', 'Numerology', 'Tarot', 'Palmistry', 'Other']
  }],
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  languages: [{
    type: String
  }],
  reputation: {
    type: Number,
    default: 0
  },
  activeRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'ConsultationRequest'
  }],
  completedConsultations: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    hasPaid: {
      type: Boolean,
      default: false
    },
    planType: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Astrologer', astrologerSchema);