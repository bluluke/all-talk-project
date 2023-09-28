const { connectToDatabase } = require('../connection')
const { ObjectId } = require("mongodb");
const mongoose = require('mongoose');


exports.addMessage = async (senderName, messageContent, chatId) => {

    const currentTimestamp = Date.now(); 
    const newMessage = {
        _id: new ObjectId(),
        senderName,
        timeOfSending: {"$timestamp":{"t": currentTimestamp,"i":0}},
        messageContent
    }

    try {
        await connectToDatabase()
        const client = mongoose.connection.client;
        const database = await client.db('all-talk-project')
        const chatListCollection = await database.collection('chat-list')

      const result = await chatListCollection.updateOne(
        { _id: chatId },
        { $push: {messages: newMessage }}
      );
      return result;
    } catch(err) {

    }
}