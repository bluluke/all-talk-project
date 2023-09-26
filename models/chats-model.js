const { connectToDatabase } = require('../connection');
const mongoose = require('mongoose');

exports.readChats = async (req, res, next) => {
    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');
        let chatListData = await chatListCollection.find({}).toArray();
        
        const compareByTimestamp = (chatA, chatB) => {
            const timeStampA = chatA.timeOfCreation["$timestamp"].t;
            const timeStampB = chatB.timeOfCreation["$timestamp"].t;
            return timeStampB - timeStampA;
        }

        chatListData.sort(compareByTimestamp);
        return chatListData;
    } catch (error) {
        console.error('Error reading chats', error)
    }
}