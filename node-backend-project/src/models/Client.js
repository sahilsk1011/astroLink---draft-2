// src/models/Client.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
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
  dateOfBirth: {
    type: Date
  },
  birthTime: {
    type: String
  },
  birthPlace: {
    type: String
  },
  consultationRequests: [{
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

module.exports = mongoose.model('Client', clientSchema);