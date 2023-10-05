const { connectToDatabase } = require('../connection')
const mongoose = require('mongoose'); 

exports.readNames = async () => {
    try {
        await connectToDatabase();
        const client = mongoose.connection.client; 
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list'); 
        const projection = { chatName: 1, _id: 1, timeOfCreation: 1 }; 

        const chatNamesData = await chatListCollection
            .find({}, {projection}).toArray();

        const compareByTimeStamp = (nameA, nameB) => {
            const timeStampA = nameA.timeOfCreation["$timestamp"].t; 
            const timeStampB = nameB.timeOfCreation["$timestamp"].t;
            return timeStampB - timeStampA; 
        };
        chatNamesData.sort(compareByTimeStamp);
            return chatNamesData;

    } catch (error) {
        console.error('Error reading names', error)
    }
}