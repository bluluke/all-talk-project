const { connectToDatabase } = require('../connection');
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const NewChat = require('../schema/new-chat-schema');

exports.readChats = async (fromDate, toDate) => {
    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');
        let chatListData;
        if(typeof fromDate === 'number' && !isNaN(fromDate) && typeof toDate === 'number' && !isNaN(toDate)) {
            chatListData = await chatListCollection
            .find({
                'timeOfCreation.$timestamp.t': { $gte: fromDate, $lte: toDate }
            }).toArray();
        } else if(typeof fromDate === 'number' && !isNaN(fromDate)) {
            chatListData = await chatListCollection
            .find({
                'timeOfCreation.$timestamp.t': { $gte: fromDate }
        }).toArray()
        } else if(typeof toDate === 'number' && !isNaN(toDate)) {
            chatListData = await chatListCollection
            .find({
                'timeOfCreation.$timestamp.t': { $lte: toDate}
        }).toArray()
        } else {
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

exports.addChat = async (chatName, chatCreator) => {
const currentTimestamp = Date.now();

    const newChat = new NewChat({
        _id: new ObjectId(), 
        chatName,
        chatCreator,
        timeOfCreation: {"$timestamp":{"t": currentTimestamp,"i":0}}
    })

    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');

        return chatListCollection.insertOne(newChat)
    } catch(err) {
        console.log(err);
    }
}

exports.readSingleChat = async (chatId, next) => {

    try {
        await connectToDatabase();
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list');

        const query = { _id: chatId };
        const chatDocument = await chatListCollection.findOne(query);
        return chatDocument;
    } catch (error) {
        console.error('Error reading single chat: ', error)
    }
}