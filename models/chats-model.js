const { connectToDatabase } = require('../connection');
const mongoose = require('mongoose');

exports.readChats = async (fromDate, toDate) => {
    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');
        let chatListData;
        if(fromDate) {
            chatListData = await chatListCollection
            .find({
                'timeOfCreation.$timestamp.t': { $gte: fromDate }
        }).toArray()
    } else if(typeof toDate === 'number' && !isNaN(toDate)) {
        chatListData = await chatListCollection
        .find({
            'timeOfCreation.$timestamp.t': { $lte: toDate}
        }).toArray()
    }
    else {
        chatListData = await chatListCollection
            .find({}).toArray() 
    }
        const compareByTimestamp = (chatA, chatB) => {
            const timeStampA = chatA.timeOfCreation["$timestamp"].t;
            const timeStampB = chatB.timeOfCreation["$timestamp"].t;
            return timeStampB - timeStampA;
        };
        chatListData.sort(compareByTimestamp);
        return chatListData;
    } catch (error) {
        console.error('Error reading chats', error)
    }
}