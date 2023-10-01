const mongoose = require('mongoose');

const newMessageSchema = new mongoose.Schema({
    senderName: {
        type: String,
        required: true,
    },
    timeOfSending: {
        type: Date,
        required: true,
    },
    messageContent: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('NewMessage', newMessageSchema);