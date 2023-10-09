const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types

const newMessageSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new ObjectId().toString()
    },
    senderName: {
        type: String,
        required: true,
    },
    timeOfSending: {
        type: Object,
        required: true,
    },
    messageContent: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('NewMessage', newMessageSchema);