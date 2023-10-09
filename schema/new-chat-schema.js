const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types

const newChatSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => new ObjectId().toString()
    },
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

