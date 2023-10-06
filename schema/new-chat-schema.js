const mongoose = require('mongoose');

const newChatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
    },
    chatCreator: {
        type: String,
        required: true,
    },
    messages: {
        type: Array,
        default: [],
    },
    timeOfCreation: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('NewChat', newChatSchema);

