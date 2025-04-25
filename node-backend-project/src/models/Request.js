const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    title: { type: String, required: true },
    birthDetails: {
        date: { type: String, required: true },
        time: { type: String, required: true },
        location: { type: String, required: true }
    },
    status: { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    maxAstrologers: { type: Number, default: 3 },
    assignedAstrologers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Astrologer' }],
    chatChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatChannel' }]
});

module.exports = mongoose.model('Request', RequestSchema);