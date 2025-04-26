// src/models/ConsultationRequest.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const consultationRequestSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  birthDetails: {
    dateOfBirth: Date,
    birthTime: String,
    birthPlace: String
  },
  question: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  maxAstrologers: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  assignedAstrologers: [{
    type: Schema.Types.ObjectId,
    ref: 'Astrologer'
  }],
  chatChannels: [{
    type: Schema.Types.ObjectId,
    ref: 'ChatChannel'
  }],
  expiresAt: {
    type: Date
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

// Virtual for assigned astrologer count
consultationRequestSchema.virtual('assignedAstrologersCount').get(function() {
  return this.assignedAstrologers.length;
});

// Set expiration date on creation
consultationRequestSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Set expiration to 7 days from creation
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    this.expiresAt = expirationDate;
  }
  next();
});

module.exports = mongoose.model('ConsultationRequest', consultationRequestSchema);