const mongoose = require('mongoose');
const agentInteractionSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
        trim: true,
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    language:{
        type: String,
        default: 'en-IN',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model('AgentInteraction', agentInteractionSchema);