const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types
const newMessageSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        default: () => new ObjectId()
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