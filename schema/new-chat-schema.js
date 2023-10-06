const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types

const newChatSchema = new mongoose.Schema({
    _id: {
        type: ObjectId,
        default: () => new ObjectId()
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

