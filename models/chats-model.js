const { connectToDatabase } = require('../connection');
const mongoose = require('mongoose');

exports.readChats = async (req, res, next) => {
    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');
        const chatListData = await chatListCollection.find({}).toArray();
        return chatListData;
    } catch (error) {
        console.error('Error reading chats', error)
    }
}