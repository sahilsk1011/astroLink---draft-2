const mongoose = require('mongoose');

const ChatChannelSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer', required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    messages: [{
        sender: { type: String, enum: ['client', 'astrologer'], required: true },
        content: { type: String, required: true },
        contentType: { type: String, enum: ['text', 'image', 'file'], required: true },
        timestamp: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model('ChatChannel', ChatChannelSchema);